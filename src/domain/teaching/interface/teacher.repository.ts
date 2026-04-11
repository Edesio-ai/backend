import { Teacher } from 'src/domain/teaching/types/teacher.type';

export const TEACHER_REPOSITORY = Symbol('TEACHER_REPOSITORY');

export interface TeacherRepository {
  linkTeacherToEstablishment(
    invitationTokenId: string,
    teacherId: string,
    establishmentId: string,
  ): Promise<void>;
  getTeacherByEstablishmentId(establishmentId: string): Promise<any>;
  getTeachersSessionsByIds(teacherIds: string[]): Promise<any>;
  getTeacherByUserId(userId: string): Promise<Teacher>;
  createTeacher(
    userId: string,
    name: string,
    email: string,
  ): Promise<Teacher | null>;
}
