import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interfaces/questions.repository';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interfaces/session.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interfaces/teacher.repository';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/interfaces/i-course-file.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/interfaces/i-student-session.repository';

export class DeleteSessionUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
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
