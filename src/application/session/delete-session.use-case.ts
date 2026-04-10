import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/interfaces/persistence/course.repository';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/interfaces/persistence/questions.repository';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/interfaces/persistence/session.repository';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/interfaces/persistence/teacher.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/interfaces/persistence/student.repository';

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
    @Inject(STUDENT_REPOSITORY)
    private readonly studentSupabaseRepository: StudentRepository,
  ) {}

  async execute(sessionId: string, userId: string): Promise<void> {
    const sessionCourses =
      await this.courseRepository.getCoursesBySessionId(sessionId);

    if (sessionCourses && sessionCourses.length > 0) {
      const sessionCoursesIds = sessionCourses.map((c) => c.id);

      await this.questionsRepository.deleteQuestionsByCourseIds(
        sessionCoursesIds,
      );
      await this.courseRepository.deleteCoursesFilesByCourseIds(
        sessionCoursesIds,
      );
    }

    await this.courseRepository.deleteCoursesBySessionId(sessionId);
    await this.studentSupabaseRepository.deleteStudentSessionsBySessionId(
      sessionId,
    );

    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    const teahcerId = teacher.id;

    await this.sessionRepository.deleteSessionByTeacherId(sessionId, teahcerId);
  }
}
