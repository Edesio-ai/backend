import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';
import {
  CourseRanking,
  CourseRankingWithRate,
} from 'src/domain/teaching/types/course.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interfaces/teacher.repository';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from 'src/domain/teaching/interfaces/session.repository';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interfaces/student.repository';
import { StudentCourseStatsWithStudent } from 'src/domain/teaching/types/student.type';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';

@Injectable()
export class GetCourseRankingUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<CourseRanking[]> {
    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    // We ony handle teacher role for now but in the future we will handle students too
    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id ${user.id} not found`);
    }

    const session = await this.sessionRepository.getSessionById(
      course.sessionId,
    );

    if (session && session.teacherId !== teacher.id) {
      console.error('session teacher id does not match teacher id', {
        sessionId: session.teacherId,
        teacherId: teacher.id,
      });
      throw new ForbiddenException(
        'You are not authorized to access this course',
      );
    }

    const studentStats =
      await this.studentRepository.getStudentStatsByCourseId(courseId);
    const rankingWithRate = this.getRankingWithRate(studentStats);
    const statsSortedByRate = this.getStatsSortedByRate(rankingWithRate);

    return this.getRankingWithRank(statsSortedByRate);
  }

  private getStatsSortedByRate(
    rankingWithRate: CourseRankingWithRate[],
  ): CourseRankingWithRate[] {
    return rankingWithRate.sort((a, b) => {
      if (b.successRate !== a.successRate) {
        return b.successRate - a.successRate;
      }
      return b.correctAnswers - a.correctAnswers;
    });
  }

  private getRankingWithRank(
    rankingWithRate: CourseRankingWithRate[],
  ): CourseRanking[] {
    return rankingWithRate.map((stat, index) => ({
      ...stat,
      rank: index + 1,
    }));
  }

  private getRankingWithRate(
    studentStats: StudentCourseStatsWithStudent[],
  ): CourseRankingWithRate[] {
    return studentStats.map((row): CourseRankingWithRate => {
      const student = row.student;
      const successRate =
        row.attemptedQuestions > 0
          ? Math.round((row.correctAnswers / row.attemptedQuestions) * 100)
          : 0;

      return {
        studentId: row.studentId,
        name: student.name,
        photoUrl: student.photoUrl,
        attemptedQuestions: row.attemptedQuestions,
        correctAnswers: row.correctAnswers,
        successRate: successRate,
        lastAttempt: row.lastAttemptAt,
      };
    });
  }
}
