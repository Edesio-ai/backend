import { Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  type IStudentCourseStatsRepository,
  STUDENT_COURSE_STATS_REPOSITORY,
} from 'src/domain/teaching/interfaces/i-student-course-stats.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';

type UpdateOrCreateStudentCourseStatsBoyd = {
  attemptedQuestions: number;
  correctAnswers: number;
};
export class UpdateOrCreateStudentCourseStatsUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(STUDENT_COURSE_STATS_REPOSITORY)
    private readonly studentCourseStatsRepository: IStudentCourseStatsRepository,
  ) {}

  async execute(
    courseId: string,
    user: AuthUser,
    body: UpdateOrCreateStudentCourseStatsBoyd,
  ): Promise<void> {
    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const existingStats =
      await this.studentCourseStatsRepository.getStudentCourseStatsByStudentIdAndCourseId(
        student.id,
        courseId,
      );

    if (existingStats) {
      await this.studentCourseStatsRepository.updateStudentCourseStats(
        existingStats.id,
        body,
      );
    } else {
      const statToInser = {
        studentId: student.id,
        courseId: courseId,
        attemptedQuestions: body.attemptedQuestions,
        correctAnswers: body.correctAnswers,
        lastAttemptAt: new Date().toISOString(),
      };
      await this.studentCourseStatsRepository.createStudentCourseStats(
        statToInser,
      );
    }
  }
}
