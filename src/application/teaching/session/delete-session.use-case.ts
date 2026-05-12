import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type ICourseRepository,
} from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  QUESTIONS_REPOSITORY,
  type IQuestionsRepository,
} from 'src/domain/teaching/question/contracts/i-questions.repository';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import {
  TEACHER_REPOSITORY,
  type ITeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';

export class DeleteSessionUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: IQuestionsRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(sessionId: string, userId: string): Promise<void> {
    const sessionCourses =
      await this.courseRepository.getCoursesBySessionId(sessionId);

    if (sessionCourses && sessionCourses.length > 0) {
      const sessionCoursesIds = sessionCourses.map((c) => c.id);

      await this.questionsRepository.deleteQuestionsByCourseIds(
        sessionCoursesIds,
      );
      await this.courseFileRepository.deleteCoursesFilesByCourseIds(
        sessionCoursesIds,
      );
    }

    await this.courseRepository.deleteCoursesBySessionId(sessionId);
    await this.studentSessionRepository.deleteStudentSessionsBySessionId(
      sessionId,
    );

    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id ${userId} not found`);
    }
    const teahcerId = teacher.id;

    await this.sessionRepository.deleteSessionByTeacherId(sessionId, teahcerId);
  }
}
