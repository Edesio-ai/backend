import { Inject } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_REPOSITORY,
  type ICourseRepository,
} from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from 'src/domain/shared/errors/global.errors';
import {
  TEACHER_REPOSITORY,
  type ITeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  Question,
  QuestionType,
} from 'src/domain/teaching/question/types/question.type';

interface UpdateQuestionBody {
  questionText?: string | undefined;
  correctAnswers?: string[] | undefined;
  explanation?: string | undefined;
  type?: QuestionType | undefined;
  proposals?: string[] | undefined;
  positionOrder?: number | undefined;
}

export class UpdateQuestionByIdUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: ICourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  async execute(
    questionId: string,
    body: UpdateQuestionBody,
    user: AuthUser,
  ): Promise<Question> {
    const {
      questionText,
      correctAnswers,
      explanation,
      type,
      proposals,
      positionOrder,
    } = body;
    const question = await this.questionsRepository.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundError('Question not found');
    }

    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const select = 'id, sessions:sessions!inner(teacher_id)';
    const courseWithSession =
      await this.coursesRepository.getCourseWithSessionById(
        question.courseId,
        select,
      );

    if (!courseWithSession) {
      throw new NotFoundError('Course not found');
    }

    if (courseWithSession.session.teacherId !== teacher.id) {
      console.error(
        `teacher not allowed to update this question, course teacher id: ${courseWithSession.session.teacherId}, teacher id: ${teacher.id}`,
      );
      throw new UnauthorizedError(
        'You are not allowed to update this question',
      );
    }

    const updates: Record<string, unknown> = {};

    if (type !== undefined) {
      updates.type = type;
      switch (type) {
        case 'single':
          updates.proposals = ['Option A', 'Option B', 'Option C', 'Option D'];
          updates.correctAnswers = ['Option A'];
          break;
        case 'multiple':
          updates.proposals = ['Option A', 'Option B', 'Option C', 'Option D'];
          updates.correctAnswers = ['Option A'];
          break;
        case 'open':
          updates.propositions = null;
          updates.correctAnswers = null;
          break;
        default:
          throw new BadRequestError('Invalid type');
      }
    }

    if (questionText !== undefined) updates.questionText = questionText;
    if (proposals !== undefined) updates.proposals = proposals;
    if (correctAnswers !== undefined) updates.correctAnswers = correctAnswers;
    if (explanation !== undefined) updates.explanation = explanation;
    if (positionOrder !== undefined) updates.positionOrder = positionOrder;
    const updatedQuestion = await this.questionsRepository.updateQuestionById(
      questionId,
      updates,
    );

    return updatedQuestion;
  }
}
