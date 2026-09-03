import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { isAdmin } from 'src/domain/auth/role.utils';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  CourseRanking,
  CourseRankingWithRate,
} from 'src/domain/teaching/student-course-stats/types/student-course-stats.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import { StudentCourseStatsWithStudent } from 'src/domain/teaching/student-course-stats/types/student-course-stats.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  type IStudentCourseStatsRepository,
  STUDENT_COURSE_STATS_REPOSITORY,
} from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';
import { Course } from 'src/domain/teaching/course/types/course.type';
import {
  type IStudentRepository,
  STUDENT_REPOSITORY,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';

@Injectable()
export class GetCourseRankingUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(STUDENT_COURSE_STATS_REPOSITORY)
    private readonly studentCourseStatsRepository: IStudentCourseStatsRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
  ) {}

  async execute(courseId: string, user: AuthUser): Promise<CourseRanking[]> {
    const { role } = user.metadata;

    const course = await this.courseRepository.getCourseById(courseId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    if (!isAdmin(role)) {
      switch (role) {
        case 'teacher': {
          await this.checkTeacherAccess(course, user);
          break;
        }
        case 'student': {
          await this.checkStudentAccess(course, user);
          break;
        }
        default: {
          throw new ForbiddenException('You are not authorized to access this course');
        }
      }
    }

    const studentCourseStats = await this.studentCourseStatsRepository.getStudentCourseStatsByCourseId(courseId);
    const rankingWithRate = this.getRankingWithRate(studentCourseStats);
    const statsSortedByRate = this.getStatsSortedByRate(rankingWithRate);

    return this.getRankingWithRank(statsSortedByRate);
  }

  private getStatsSortedByRate(rankingWithRate: CourseRankingWithRate[]): CourseRankingWithRate[] {
    return rankingWithRate.sort((a, b) => {
      if (b.successRate !== a.successRate) {
        return b.successRate - a.successRate;
      }
      return b.correctAnswers - a.correctAnswers;
    });
  }

  private getRankingWithRank(rankingWithRate: CourseRankingWithRate[]): CourseRanking[] {
    return rankingWithRate.map((stat, index) => ({
      ...stat,
      rank: index + 1,
    }));
  }

  private getRankingWithRate(studentStats: StudentCourseStatsWithStudent[]): CourseRankingWithRate[] {
    return studentStats.map((row): CourseRankingWithRate => {
      const student = row.student;
      const successRate =
        row.attemptedQuestions > 0 ? Math.round((row.correctAnswers / row.attemptedQuestions) * 100) : 0;

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

  private async checkTeacherAccess(course: Course, user: AuthUser): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id ${user.id} not found`);
    }

    const session = await this.sessionRepository.getSessionById(course.sessionId);

    if (session && session.teacherId !== teacher.id) {
      console.error('session teacher id does not match teacher id', {
        sessionId: session.teacherId,
        teacherId: teacher.id,
      });
      throw new ForbiddenException('You are not authorized to access this course');
    }
  }

  private async checkStudentAccess(course: Course, user: AuthUser): Promise<void> {
    const student = await this.studentRepository.getStudentByUserId(user.id);
    if (!student) {
      throw new NotFoundError(`Student with id ${user.id} not found`);
    }

    const studentSession = await this.studentSessionRepository.getStudentSession(course.sessionId, student.id);
    if (!studentSession) {
      throw new ForbiddenException('You are not authorized to access this course');
    }
  }
}
