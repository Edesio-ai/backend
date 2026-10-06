import { Question, QuestionType } from 'src/domain/teaching/question/types/question.type';
import { Inject } from '@nestjs/common';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { NotFoundError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';

export interface CreateQuestionBody {
  courseId: string;
  type: QuestionType;
  questionText: string;
  correctAnswers: string[];
  proposals?: string[];
  explanation?: string | undefined | null;
  cheatingDetectionEnabled?: boolean;
}
export class CreateQuestionUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: ITeacherRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: ICourseRepository,
  ) {}

  async execute(body: CreateQuestionBody, user: AuthUser): Promise<Question> {
    const teacher = await this.teachersRepository.getTeacherByUserId(user.id);

    if (!teacher) {
      throw new UnauthorizedError(`Unauthorized, teacher not exists: ${user.id}`);
    }

    const select = `
            id,
            sessions:sessions!inner (
                teacher_id
            )
        `;
    const courseWithSession = await this.coursesRepository.getCourseWithSessionById(body.courseId, select);

    if (!courseWithSession) {
      throw new NotFoundError(`Course with id ${body.courseId} not found`);
    }

    if (courseWithSession.session.teacherId !== teacher.id) {
      throw new UnauthorizedError(`Unauthorized, course not belongs to teacher: ${body.courseId}`);
    }

    const question = await this.questionsRepository.insertQuestion(body);
    return question;
  }
}
