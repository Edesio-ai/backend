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
    console.log('avant establishment');
    const establishment =
      await this.establishmentRepository.getEstablishmentByUserId(userId);

    console.log('avant teachers');
    const teachers = await this.teacherRepository.getTeacherByEstablishmentId(
      establishment.id,
    );
    console.log('avant teachersIds');
    const teachersIds = (teachers || []).map((t) => t.id);

    console.log('avant teachersSessions');
    const teachersSessions =
      await this.teacherRepository.getTeachersSessionsByIds(teachersIds);
    console.log('avant teacherSessionIds');
    const teacherSessionIds = (teachersSessions || []).map((s) => s.id);

    console.log('avant studentsSessions');
    const studentsSessions: StudentSession[] =
      await this.studentRepository.getStudentsSessionsByIds(teacherSessionIds);

    console.log('avant studentCountPerSession');
    const studentCountPerSession: Record<string, number> = {};
    console.log('avant uniqueStudents');
    const uniqueStudents = new Set<string>();
    console.log('avant forEach');

    (studentsSessions || []).forEach((ss) => {
      studentCountPerSession[ss.sessionId] =
        (studentCountPerSession[ss.sessionId] || 0) + 1;
      uniqueStudents.add(ss.studentId);
    });

    console.log('avant buildTeachersWithStats');
    const TeachersWithStats = this.buildTeachersWithStats(
      teachers,
      teachersSessions,
      studentCountPerSession,
    );
    console.log(
      '🚀 ~ GetEstablishmentsStatsUseCase ~ execute ~ TeachersWithStats:',
      TeachersWithStats,
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
      const profStudentCount = teacherSessions.reduce(
        (sum, s) => sum + (studentCountPerSession[s.id] || 0),
        0,
      );

      return {
        ...teacher,
        sessions_count: teacherSessions.length,
        students_count: profStudentCount,
        sessions: teacherSessions.map((s) => ({
          ...s,
          students_count: studentCountPerSession[s.id] || 0,
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
