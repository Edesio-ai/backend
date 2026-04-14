import { Question } from 'src/domain/teaching/types/question.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Inject } from '@nestjs/common';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interface/questions.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import {
  TeacherNotFoundError,
  CourseNotFoundError,
} from 'src/domain/teaching/error';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';
import { ForbiddenError } from 'src/domain/shared/errors/global.errors';

export class GetCourseQuestionsUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: TeacherRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: CourseRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<Question[]> {
    const teacher = await this.teachersRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new TeacherNotFoundError();
    }

    const course =
      await this.coursesRepository.getCourseWithSessionById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    const sessionTeacherId = course.session.teacherId;
    if (sessionTeacherId !== teacher.id) {
      throw new ForbiddenError(
        `Session teacher id ${sessionTeacherId} does not match the teacher id ${teacher.id}`,
      );
    }

    return this.questionsRepository.getCourseQuestions(courseId);
  }
}
