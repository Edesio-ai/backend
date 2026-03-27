import { Inject } from "@nestjs/common";
import { ESTABLISHMENT_REPOSITORY } from "../../interfaces/persistence/establishment.repository";
import { type EstablishmentRepository } from "../../interfaces/persistence/establishment.repository";
import { STUDENT_REPOSITORY, type StudentRepository } from "../../interfaces/persistence/student.repository";
import { TEACHER_REPOSITORY, type TeacherRepository } from "../../interfaces/persistence/teacher.repository";

export class GetEstablishmentsStatsUseCase {
    constructor(
        @Inject(ESTABLISHMENT_REPOSITORY)
        private readonly establishmentRepository: EstablishmentRepository,
        @Inject(STUDENT_REPOSITORY)
        private readonly studentRepository: StudentRepository,
        @Inject(TEACHER_REPOSITORY)
        private readonly teacherRepository: TeacherRepository,
    ) { }


    async execute(userId: string): Promise<any> {
        const establishment = await this.establishmentRepository.getEstablishmentByUserId(userId);

        const teachers = await this.teacherRepository.getTeacherByEstablishmentId(establishment.id);
        const teachersIds = (teachers || []).map(t => t.id)

        const teachersSessions = await this.teacherRepository.getTeachersSessionsByIds(teachersIds);
        const teacherSessionIds = (teachersSessions || []).map(s => s.id);

        const studentsSessions = await this.studentRepository.getStudentsSessionsByIds(teacherSessionIds);

        const studentCountPerSession: Record<string, number> = {};
        const uniqueStudents = new Set<string>();

        (studentsSessions || []).forEach(es => {
            studentCountPerSession[es.session_id] = (studentCountPerSession[es.session_id] || 0) + 1;
            uniqueStudents.add(es.eleve_id);
        });

        const professeursWithStats = this.buildProfesseursWithStats(teachers, teachersSessions, studentsSessions);

        return this.buildStats(establishment, teachers, teachersSessions, professeursWithStats, uniqueStudents);
    }

    private buildProfesseursWithStats(teachers: any, teachersSessions: any, studentCountPerSession: any): any {
        (teachers || []).map(prof => {
            const profSessions = (teachersSessions || []).filter(s => s.professeur_id === prof.id);
            const profStudentCount = profSessions.reduce((sum, s) => sum + (studentCountPerSession[s.id] || 0), 0);

            return {
                ...prof,
                sessions_count: profSessions.length,
                students_count: profStudentCount,
                sessions: profSessions.map(s => ({
                    ...s,
                    students_count: studentCountPerSession[s.id] || 0,
                })),
            };
        });

    }

    private buildStats(establishment: any, teachers: any, teachersSessions: any, professeursWithStats: any, uniqueStudents: any): any {
        return {
            establishment,
            professeurs: professeursWithStats,
            stats: {
                totalProfesseurs: teachers?.length || 0,
                totalSessions: teachersSessions?.length || 0,
                totalEleves: uniqueStudents.size,
            },
        };
    }
}