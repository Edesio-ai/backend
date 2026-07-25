import { Inject } from '@nestjs/common';
import { ESTABLISHMENT_REPOSITORY } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import { type IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';

import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { Teacher, TeacherWithStats } from 'src/domain/teaching/teacher/types/teacher.type';
import { Establishment, EstablishmentStats } from 'src/domain/teaching/establishment/types/establishment.type';
import {
  type IStudentSessionRepository,
  STUDENT_SESSION_REPOSITORY,
} from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import { StudentSession } from 'src/domain/teaching/student-session/types/student-session.type';
import { Session } from 'src/domain/teaching/session/types/session.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';

export class GetEstablishmentsStatsUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(STUDENT_SESSION_REPOSITORY)
    private readonly studentSessionRepository: IStudentSessionRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(userId: string): Promise<EstablishmentStats> {
    const establishment = await this.establishmentRepository.getEstablishmentByUserId(userId);

    if (!establishment) {
      throw new NotFoundError(`Establishment not found`);
    }

    const teachers = await this.teacherRepository.getTeacherByEstablishmentId(establishment.id);

    const teachersIds = (teachers || []).map((t) => t.id);

    const teachersSessions = await this.sessionRepository.getTeachersSessionsByIds(teachersIds);
    const teacherSessionIds = (teachersSessions || []).map((s) => s.id);

    const studentsSessions: StudentSession[] =
      await this.studentSessionRepository.getStudentsSessionsByIds(teacherSessionIds);

    const studentCountPerSession: Record<string, number> = {};
    const uniqueStudents = new Set<string>();

    (studentsSessions || []).forEach((ss) => {
      studentCountPerSession[ss.sessionId] = (studentCountPerSession[ss.sessionId] || 0) + 1;
      uniqueStudents.add(ss.studentId);
    });

    const TeachersWithStats = this.buildTeachersWithStats(teachers, teachersSessions, studentCountPerSession);

    return this.buildEstablishmentStats(establishment, teachers, teachersSessions, TeachersWithStats, uniqueStudents);
  }

  private buildTeachersWithStats(
    teachers: Teacher[],
    teachersSessions: Session[],
    studentCountPerSession: Record<string, number>,
  ): TeacherWithStats[] {
    return (teachers || []).map((teacher) => {
      const teacherSessions = (teachersSessions || []).filter((s) => s.teacherId === teacher.id);
      const teacherStudentsCount = teacherSessions.reduce((sum, s) => sum + (studentCountPerSession[s.id] || 0), 0);

      return {
        ...teacher,
        sessionsCount: teacherSessions.length,
        studentsCount: teacherStudentsCount,
        sessions: teacherSessions.map((s) => ({
          ...s,
          studentsCount: studentCountPerSession[s.id] || 0,
        })),
      };
    });
  }

  private buildEstablishmentStats(
    establishment: Establishment,
    teachers: Teacher[],
    teachersSessions: Session[],
    teachersWithStats: TeacherWithStats[],
    uniqueStudents: Set<string>,
  ): EstablishmentStats {
    return {
      establishment,
      teachers: teachersWithStats,
      stats: {
        totalTeachers: teachers?.length || 0,
        totalSessions: teachersSessions?.length || 0,
        totalStudents: uniqueStudents.size,
      },
    };
  }
}
