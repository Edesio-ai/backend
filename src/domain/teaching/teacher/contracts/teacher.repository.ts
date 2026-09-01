import { InvitationToken } from 'src/domain/auth/invitation.type';
import { User } from 'src/domain/auth/types/auth.type';
import { Teacher, UpdateTeacherPayload } from 'src/domain/teaching/teacher/types/teacher.type';

export const TEACHER_REPOSITORY = Symbol('TEACHER_REPOSITORY');

export interface ITeacherRepository {
  linkTeacherToEstablishment(invitationTokenId: string, teacherId: string, establishmentId: string): Promise<void>;
  getTeacherByEstablishmentId(establishmentId: string): Promise<Teacher[]>;
  getTeacherByUserId(userId: string): Promise<Teacher | null>;
  createTeacher(userId: string, name: string, email: string): Promise<Teacher | null>;
  getTeacherByConditions(
    conditions: Partial<Record<'id' | 'establishmentId' | 'teacherId', string>>,
  ): Promise<Teacher | null>;
  createTeacherWithInvitationToken(adminData: User, invitationToken: InvitationToken): Promise<Teacher>;
  updateTeacher(userId: string, payload: UpdateTeacherPayload): Promise<void>;
  deleteTeacher(id: string): Promise<void>;
}
