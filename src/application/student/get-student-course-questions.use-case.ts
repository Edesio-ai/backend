import { Inject } from '@nestjs/common';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interface/questions.repository';
import { CourseQuestion } from 'src/domain/teaching/types/course-question.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interface/course.repository';

export class GetStudentCourseQuestionsUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<CourseQuestion[]> {
    await this.checkStudentAccess(courseId, user.id);
    return this.questionsRepository.getStudentCourseQuestions(courseId);
  }

  private async checkStudentAccess(
    courseId: string,
    userId: string,
  ): Promise<void> {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student) {
      throw new NotFoundError();
    }
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    const studentSession =
      await this.studentRepository.getStudentSessionBySessionId(
        course.sessionId,
      );
    if (!studentSession) {
      throw new ForbiddenError(
        `Student session not found for course id ${courseId}`,
      );
    }

    if (studentSession.studentId !== student.id) {
      throw new ForbiddenError(
        `Student id ${student.id} does not match the student session id ${studentSession.studentId}`,
      );
    }
  }
}
