import { Inject, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import { UpdateOrCreateStudentCourseStatsBodyDto } from 'src/presentation/teaching/student-course-stats/dtos/update-or-create-student-course-stats.dto';

export class UpdateOrCreateStudentCourseStatsUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(
    courseId: string,
    user: AuthUser,
    body: UpdateOrCreateStudentCourseStatsBodyDto,
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
      await this.studentRepository.getStudentCourseStatsByStudentIdAndCourseId(
        student.id,
        courseId,
      );

    if (existingStats) {
      await this.studentRepository.updateStudentCourseStats(
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
      await this.studentRepository.createStudentCourseStats(statToInser);
    }
  }
}
