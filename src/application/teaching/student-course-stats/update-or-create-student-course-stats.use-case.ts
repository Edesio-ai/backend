import { Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_REPOSITORY,
  type ICourseRepository,
} from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  type IStudentCourseStatsRepository,
  STUDENT_COURSE_STATS_REPOSITORY,
} from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';

type UpdateOrCreateStudentCourseStatsBoyd = {
  attemptedQuestions: number;
  correctAnswers: number;
};
export class UpdateOrCreateStudentCourseStatsUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
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
