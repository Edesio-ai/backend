import { QuestionType } from 'src/domain/teaching/types/question.type';
import { Inject } from '@nestjs/common';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interfaces/questions.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { UnauthorizedError } from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interfaces/teacher.repository';

export interface CreateQuestionBody {
  courseId: string;
  type: QuestionType;
  questionText: string;
  correctAnswers: string[];
  proposals?: string[];
  explanation?: string | undefined | null;
}
export class CreateQuestionUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: TeacherRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: CourseRepository,
  ) {}

  async execute(body: CreateQuestionBody, user: AuthUser): Promise<any> {
    const teacher = await this.teachersRepository.getTeacherByUserId(user.id);

    if (!teacher) {
      throw new UnauthorizedError(
        `Unauthorized, teacher not exists: ${user.id}`,
      );
    }

    const select = `
            id,
            sessions:sessions!inner (
                teacher_id
            )
        `;
    const courseWithSession =
      await this.coursesRepository.getCourseWithSessionById(
        body.courseId,
        select,
      );

    if (courseWithSession.session.teacherId !== teacher.id) {
      throw new UnauthorizedError(
        `Unauthorized, course not belongs to teacher: ${body.courseId}`,
      );
    }

    const question = await this.questionsRepository.insertQuestion(body);
    return question;
  }
}
