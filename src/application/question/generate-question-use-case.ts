import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import { CourseFile } from 'src/domain/teaching/types/course.type';
import {
  GeneratedQuestion,
  Question,
  QuestionGenerationConfig,
} from 'src/domain/teaching/types/question.type';
import {
  PDF_EXTRACTOR,
  type PdfExtractor,
} from 'src/domain/pdf/contracts/pdf-extractor.interface';
import {
  QuestionBadRequestError,
  TeacherNotFoundError,
} from 'src/domain/teaching/error';
import {
  OPENAI_REPOSITORY,
  type OpenaiRepository,
} from 'src/domain/shared/llm/openai/contracts/opena-ai.repository';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interface/questions.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import { ForbiddenError } from 'src/domain/shared/global/errors/global.errors';

export type GenerateQuestionBody = {
  courseId: string;
  totalQuestions?: number;
  multipleChoiceCount?: number;
  openedCount?: number;
};

export class GenerateQuestionUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(PDF_EXTRACTOR)
    private readonly pdfExtractor: PdfExtractor,
    @Inject(OPENAI_REPOSITORY)
    private readonly openaiRepository: OpenaiRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionRepository: QuestionsRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async execute(
    body: GenerateQuestionBody,
    user: AuthUser,
  ): Promise<Question[]> {
    const { courseId } = body;

    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new TeacherNotFoundError();
    }

    const select = '*, session:sessions!inner(language, teacher_id)';

    const courseWithSession =
      await this.courseRepository.getCourseWithSessionById(courseId, select);

    if (courseWithSession.session.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to modify this course');
    }

    const language = courseWithSession.session.language || 'francais';
    const courseFiles =
      await this.courseRepository.getCourseFilesByCourseId(courseId);

    const contentText = courseWithSession.contentText || '';
    const combinedText = await this.getCombinedText(contentText, courseFiles);

    const config: QuestionGenerationConfig = {
      totalQuestions: body.totalQuestions,
      multipleChoiceCount: body.multipleChoiceCount,
      openedCount: body.openedCount,
      language,
    };

    const questions = await this.openaiRepository.generateQuestions(
      combinedText,
      config,
    );
    if (!questions || questions.length === 0) {
      throw new QuestionBadRequestError('Échec de la génération des questions');
    }

    await this.questionRepository.deleteCourseQuizQuestions(courseId);

    const multipleQuestions = questions.filter((q) => q.type === 'multiple');
    const openQuestions = questions.filter((q) => q.type === 'open');

    const alternatedQuestions: GeneratedQuestion[] = [];
    const maxLength = Math.max(multipleQuestions.length, openQuestions.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < multipleQuestions.length)
        alternatedQuestions.push(multipleQuestions[i]);
      if (i < openQuestions.length) alternatedQuestions.push(openQuestions[i]);
    }

    const insertedQuestions = await this.questionRepository.insertQuestions(
      alternatedQuestions,
      courseId,
    );
    return insertedQuestions;
  }

  private async getCombinedText(
    contentText: string,
    files: CourseFile[],
  ): Promise<string> {
    let combinedText = contentText;
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const buffer = await this.courseRepository.getFileBufferFromStorage(
            file.fileUrl,
          );
          const pdfText = await this.pdfExtractor.extractTextFromPdf(buffer);
          if (pdfText) {
            combinedText +=
              '\n\n--- Contenu du fichier: ' +
              file.fileName +
              ' ---\n\n' +
              pdfText;
          }
        } catch (error) {
          console.error('Error processing PDF:', error);
          continue;
        }
      }
    }

    if (!combinedText.trim()) {
      console.error(
        'No content available for this course. Add text or a PDF file:',
        files,
      );
      throw new QuestionBadRequestError(
        'No content available for this course. Add text or a PDF file.',
      );
    }
    return combinedText;
  }
}
