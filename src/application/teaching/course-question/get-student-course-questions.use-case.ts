import { Inject } from '@nestjs/common';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import {
  COURSE_REPOSITORY,
  type ICourseRepository,
} from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/course-question/contracts/i-course-question.repository';
import {
  STUDENT_SESSION_REPOSITORY,
  type IStudentSessionRepository,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import {
  TEACHER_REPOSITORY,
  type ITeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  type ISessionRepository,
  SESSION_REPOSITORY,
} from 'src/domain/teaching/session/contracts/i-session.repository';

export class GetStudentCourseQuestionsUseCase {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<CourseQuestion[]> {
    const { role } = user.metadata;

    switch (role) {
      case 'student': {
        await this.checkStudentAccess(courseId, user.id);
        break;
      }
      case 'teacher': {
        break;
      }
      default: {
        throw new ForbiddenError(
          'You are not authorized to access this course',
        );
      }
    }
    return this.courseQuestionRepository.getCourseQuestionsByCourseId(courseId);
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
      await this.studentSessionRepository.getStudentSessionBySessionId(
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

  private async checkTeacherAccess(
    courseId: string,
    userId: string,
  ): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError();
    }
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }
    const session = await this.sessionRepository.getSessionById(
      course.sessionId,
    );
    if (!session) {
      throw new NotFoundError(`Session with id ${course.sessionId} not found`);
    }
    if (teacher.id !== session.teacherId) {
      throw new ForbiddenError(
        `Teacher id ${teacher.id} does not match the session teacher id ${session.teacherId}`,
      );
    }
  }
}
