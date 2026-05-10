import { Inject } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interfaces/teacher.repository';
import {
  NotFoundError,
  UnauthorizedError,
} from 'src/domain/shared/global/errors/global.errors';

import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import {
  COURSE_FILE_REPOSITORY,
  type ICourseFileRepository,
} from 'src/domain/teaching/interfaces/i-course-file.repository';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/interfaces/i-course-question.repository';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interfaces/questions.repository';
import {
  type IStudentCourseStatsRepository,
  STUDENT_COURSE_STATS_REPOSITORY,
} from 'src/domain/teaching/interfaces/i-student-course-stats.repository';

export class DeleteCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(COURSE_FILE_REPOSITORY)
    private readonly courseFileRepository: ICourseFileRepository,
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(STUDENT_COURSE_STATS_REPOSITORY)
    private readonly studentCourseStatsRepository: IStudentCourseStatsRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError();
    }

    const select = `
            id,
            sessions:sessions!inner (
                teacher_id
            )
        `;
    const courseWithSession =
      await this.courseRepository.getCourseWithSessionById(courseId, select);
    if (!courseWithSession) {
      console.error(`Course ${courseId} not found`);
      throw new NotFoundError(`Course not found`);
    }

    if (courseWithSession.session.teacherId !== teacher.id) {
      console.error(
        `Teacher ${teacher.id} is not allowed to delete course ${courseId}`,
      );
      throw new UnauthorizedError('You are not allowed to delete this course');
    }

    await this.questionsRepository.deleteCourseQuizQuestions(courseId);
    await this.courseFileRepository.deleteCoursesFilesByCourseIds([courseId]);
    await this.studentCourseStatsRepository.deleteStudentCourseStatsByCourseId(
      courseId,
    );
    await this.courseQuestionRepository.deleteCourseQuestionsByCourseId(
      courseId,
    );
    await this.courseRepository.deleteCourseById(courseId);
  }
}
