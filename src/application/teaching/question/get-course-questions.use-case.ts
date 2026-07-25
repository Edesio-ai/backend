import { Question } from 'src/domain/teaching/question/types/question.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Inject } from '@nestjs/common';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';

export class GetCourseQuestionsUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teachersRepository: ITeacherRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly coursesRepository: ICourseRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<Question[]> {
    const { role } = user.metadata;

    switch (role) {
      case 'teacher':
        await this.checkTeacherAccess(courseId, user.id);
        break;
      case 'student':
        await this.checkStudentAccess(courseId, user.id);
        break;
    }

    return (await this.questionsRepository.getCourseQuestions(courseId)) ?? [];
  }

  private async checkTeacherAccess(courseId: string, userId: string): Promise<void> {
    const teacher = await this.teachersRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id ${userId} not found`);
    }

    const select = `
      id,
      sessions:sessions!inner (
        teacher_id,
        language
      )`;

    const course = await this.coursesRepository.getCourseWithSessionById(courseId, select);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    const sessionTeacherId = course.session.teacherId;
    if (sessionTeacherId !== teacher.id) {
      throw new ForbiddenError(`Session teacher id ${sessionTeacherId} does not match the teacher id ${teacher.id}`);
    }
  }

  private async checkStudentAccess(courseId: string, userId: string): Promise<void> {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student) {
      throw new NotFoundError();
    }
    const course = await this.coursesRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    const studentSession = await this.studentSessionRepository.getStudentSessionBySessionId(course.sessionId);
    if (!studentSession) {
      throw new ForbiddenError(`Student session not found for course id ${courseId}`);
    }

    if (studentSession.studentId !== student.id) {
      throw new ForbiddenError(
        `Student id ${student.id} does not match the student session id ${studentSession.studentId}`,
      );
    }
  }
}
