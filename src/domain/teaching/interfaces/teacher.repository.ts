import { InvitationToken } from 'src/domain/auth/invitation.type';
import { User } from 'src/domain/auth/types/auth.type';
import { Teacher } from 'src/domain/teaching/types/teacher.type';

export const TEACHER_REPOSITORY = Symbol('TEACHER_REPOSITORY');

export interface TeacherRepository {
  linkTeacherToEstablishment(
    invitationTokenId: string,
    teacherId: string,
    establishmentId: string,
  ): Promise<void>;
  getTeacherByEstablishmentId(establishmentId: string): Promise<Teacher[]>;
  getTeacherByUserId(userId: string): Promise<Teacher | null>;
  createTeacher(
    userId: string,
    name: string,
    email: string,
  ): Promise<Teacher | null>;
  getTeacherByConditions(
    conditions: Partial<Record<'id' | 'establishmentId' | 'teacherId', string>>,
  ): Promise<Teacher | null>;
  createTeacherWithInvitationToken(
    adminData: User,
    invitationToken: InvitationToken,
  ): Promise<Teacher>;
}
