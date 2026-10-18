import {
  BannedSessionStudent,
  SessionStudent,
  SessionStudentsPayload,
  SessionStudentWithStats,
} from 'src/domain/teaching/student-session/types/student-session.type';
import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY, type IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import { resolveProfilePhotoUrl } from 'src/domain/auth/photo-url.utils';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from 'src/domain/teaching/student/contracts/I-student.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import { isAdmin } from 'src/domain/auth/role.utils';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ESTABLISHMENT_REPOSITORY,
  type IEstablishmentRepository,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import {
  type IStudentCourseStatsRepository,
  STUDENT_COURSE_STATS_REPOSITORY,
} from 'src/domain/teaching/student-course-stats/contracts/i-student-course-stats.repository';
import { StudentCourseStats } from 'src/domain/teaching/student-course-stats/types/student-course-stats.type';

const SESSION_STUDENT_SELECT = `
  joined_at,
  banned_at,
  students (id, name, email, photo_url, supabase_user_id)
`;

export class GetSessionStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: IStudentRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
    @Inject(STUDENT_COURSE_STATS_REPOSITORY)
    private readonly studentCourseStatsRepository: IStudentCourseStatsRepository,
  ) {}

  async execute(sessionId: string, user: AuthUser): Promise<SessionStudentsPayload> {
    const { role } = user.metadata;

    if (!isAdmin(role)) {
      switch (role) {
        case 'teacher': {
          await this.verifyTeacherAccess(user.id, sessionId);
          break;
        }
        case 'establishment': {
          await this.verifyEstablishmentAccess(user.id, sessionId);
          break;
        }
      }
    }

    const [activeStudents, bannedStudents] = await Promise.all([
      this.studentSessionRepository.listStudentsEnrolledInSession(sessionId, SESSION_STUDENT_SELECT, 'active'),
      this.studentSessionRepository.listStudentsEnrolledInSession(sessionId, SESSION_STUDENT_SELECT, 'banned'),
    ]);

    if (activeStudents.length === 0 && bannedStudents.length === 0) {
      return { students: [], bannedStudents: [] };
    }

    const avatarUrls = await this.authRepository.getAvatarUrlsByUserIds(
      [...activeStudents, ...bannedStudents].flatMap((student) =>
        student.supabaseUserId ? [student.supabaseUserId] : [],
      ),
    );
    const courseStats = await this.studentCourseStatsRepository.getStudentCourseStatsBySessionId(sessionId);

    return {
      students: this.withSessionStats(activeStudents, courseStats, avatarUrls),
      bannedStudents: this.withBannedStats(bannedStudents, courseStats, avatarUrls),
    };
  }

  private withSessionStats(
    students: SessionStudent[],
    courseStats: StudentCourseStats[],
    avatarUrls: Record<string, string>,
  ): SessionStudentWithStats[] {
    const statsByStudentId = this.aggregateStatsByStudent(courseStats);

    return students.map((student) => {
      const stats = statsByStudentId.get(student.id);
      const attemptedQuestions = stats?.attemptedQuestions ?? 0;
      const correctAnswers = stats?.correctAnswers ?? 0;

      return {
        ...student,
        photoUrl:
          resolveProfilePhotoUrl(
            student.supabaseUserId ? avatarUrls[student.supabaseUserId] : undefined,
            student.photoUrl,
          ) ?? '',
        attemptedQuestions,
        correctAnswers,
        successRate: attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0,
        lastAttemptAt: stats?.lastAttemptAt ?? null,
      };
    });
  }

  private withBannedStats(
    students: SessionStudent[],
    courseStats: StudentCourseStats[],
    avatarUrls: Record<string, string>,
  ): BannedSessionStudent[] {
    return this.withSessionStats(students, courseStats, avatarUrls).map((student) => ({
      ...student,
      bannedAt: student.bannedAt ?? '',
    }));
  }

  private aggregateStatsByStudent(courseStats: StudentCourseStats[]): Map<string, AggregatedStudentStats> {
    const statsByStudentId = new Map<string, AggregatedStudentStats>();

    for (const stat of courseStats) {
      const current = statsByStudentId.get(stat.studentId) ?? {
        attemptedQuestions: 0,
        correctAnswers: 0,
        lastAttemptAt: null,
      };

      current.attemptedQuestions += stat.attemptedQuestions;
      current.correctAnswers += stat.correctAnswers;
      if (!current.lastAttemptAt || stat.lastAttemptAt > current.lastAttemptAt) {
        current.lastAttemptAt = stat.lastAttemptAt;
      }

      statsByStudentId.set(stat.studentId, current);
    }

    return statsByStudentId;
  }

  private async verifyTeacherAccess(userId: string, sessionId: string): Promise<void> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    if (session.teacherId !== teacher.id) {
      throw new ForbiddenError('You are not authorized to access to this session data');
    }
  }

  private async verifyEstablishmentAccess(userId: string, sessionId: string): Promise<void> {
    const establishment = await this.establishmentRepository.getEstablishmentByUserId(userId);
    if (!establishment) {
      throw new NotFoundError('Establishment not found');
    }

    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      console.error(`Session not found for id ${sessionId}`);
      throw new NotFoundError(`Session not found`);
    }

    const teacher = await this.teacherRepository.getTeacherByConditions({
      establishmentId: establishment.id,
      id: session.teacherId,
    });
    if (!teacher) {
      console.error(
        `Teacher not found for establishment id ${establishment.id} and session teacher id ${session.teacherId}`,
      );
      throw new NotFoundError('Teacher not found');
    }

    if (teacher.id !== session.teacherId) {
      console.error(`Teacher id ${teacher.id} does not match the session teacher id ${session.teacherId}`);
      throw new ForbiddenError('You are not authorized to access this session');
    }
  }
}

type AggregatedStudentStats = {
  attemptedQuestions: number;
  correctAnswers: number;
  lastAttemptAt: string | null;
};
