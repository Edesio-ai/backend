import { Inject } from '@nestjs/common';
import { ESTABLISHMENT_REPOSITORY } from '../../domain/teaching/interface/establishment.repository';
import { type EstablishmentRepository } from '../../domain/teaching/interface/establishment.repository';

import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from '../../domain/teaching/interface/teacher.repository';
import {
  Teacher,
  TeacherSession,
  TeacherWithStats,
} from '../../domain/teaching/types/teacher.type';
import {
  Establishment,
  EstablishmentStats,
} from '../../domain/establishment/establishment.type';
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from 'src/domain/teaching/interface/student.repository';
import type { StudentSession } from 'src/domain/teaching/types/student.type';

export class GetEstablishmentsStatsUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async execute(userId: string): Promise<EstablishmentStats> {
    const establishment =
      await this.establishmentRepository.getEstablishmentByUserId(userId);

    const teachers = await this.teacherRepository.getTeacherByEstablishmentId(
      establishment.id,
    );
    const teachersIds = (teachers || []).map((t) => t.id);

    const teachersSessions =
      await this.teacherRepository.getTeachersSessionsByIds(teachersIds);
    const teacherSessionIds = (teachersSessions || []).map((s) => s.id);

    const studentsSessions: StudentSession[] =
      await this.studentRepository.getStudentsSessionsByIds(teacherSessionIds);

    const studentCountPerSession: Record<string, number> = {};
    const uniqueStudents = new Set<string>();

    (studentsSessions || []).forEach((ss) => {
      studentCountPerSession[ss.sessionId] =
        (studentCountPerSession[ss.sessionId] || 0) + 1;
      uniqueStudents.add(ss.studentId);
    });

    const TeachersWithStats = this.buildTeachersWithStats(
      teachers,
      teachersSessions,
      studentCountPerSession,
    );

    return this.buildEstablishmentStats(
      establishment,
      teachers,
      teachersSessions,
      TeachersWithStats,
      uniqueStudents,
    );
  }

  private buildTeachersWithStats(
    teachers: Teacher[],
    teachersSessions: TeacherSession[],
    studentCountPerSession: Record<string, number>,
  ): TeacherWithStats[] {
    return (teachers || []).map((teacher) => {
      const teacherSessions = (teachersSessions || []).filter(
        (s) => s.teacherId === teacher.id,
      );
      const teacherStudentsCount = teacherSessions.reduce(
        (sum, s) => sum + (studentCountPerSession[s.id] || 0),
        0,
      );

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
    teachersSessions: TeacherSession[],
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
