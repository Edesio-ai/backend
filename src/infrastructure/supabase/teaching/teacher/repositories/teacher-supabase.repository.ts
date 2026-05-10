import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { TeacherMapper } from '../mappers/teacher.mapper';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { TeacherRepository } from 'src/domain/teaching/interfaces/teacher.repository';
import { SUPABASE_ADMIN } from 'src/infrastructure/supabase/supabase.module';
import { Teacher } from 'src/domain/teaching/types/teacher.type';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { User } from 'src/domain/auth/types/auth.type';
import { SUPABASE_AUTH } from 'src/infrastructure/supabase/supabase-auth.module';
import { invitationTokenMapper } from 'src/infrastructure/supabase/invitation-token/mappers/invitation-token.mapper';

export class TeacherSupabaseRepository implements TeacherRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
    @Inject(SUPABASE_AUTH)
    private readonly supabaseAuth: SupabaseClient,
  ) {}

  public async getTeacherByEstablishmentId(
    establishmentId: string,
  ): Promise<Teacher[]> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('establishment_id', establishmentId);

    if (error) {
      throw new ServerError(error.message);
    }
    return (data ?? []).map(TeacherMapper.toDomain);
  }

  public async getTeacherByUserId(userId: string): Promise<Teacher | null> {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();

    if (error) {
      throw new ServerError(error.message);
    }

    return data ? TeacherMapper.toDomain(data) : null;
  }

  public async createTeacher(
    userId: string,
    name: string,
    email: string,
  ): Promise<Teacher | null> {
    const { data, error } = await this.supabase
      .from('teachers')
      .insert(TeacherMapper.toInsert(userId, name, email))
      .select()
      .single();

    if (error) {
      throw new ServerError(error.message);
    }

    return TeacherMapper.toDomain(data);
  }

  public async linkTeacherToEstablishment(
    invitationTokenId: string,
    teacherId: string,
    establishmentId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('teachers')
      .update(TeacherMapper.toEstablishmentUpdate(establishmentId))
      .eq('id', teacherId);

    if (error) {
      await this.supabase
        .from('invitation_tokens')
        .update({ used_at: null, used_by: null })
        .eq('id', invitationTokenId);
      throw new ServerError(error.message);
    }
  }

  public async getTeacherByConditions(
    conditions: Partial<Record<'id' | 'establishmentId' | 'teacherId', string>>,
  ): Promise<Teacher | null> {
    let query = this.supabase.from('teachers').select('*');

    const formatedConditions = TeacherMapper.toCondition(conditions);
    for (const [key, value] of Object.entries(formatedConditions)) {
      query = query.eq(key, value);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(
        `An error occure while getting teacher by conditions:`,
        error,
      );
      throw new ServerError(error.message);
    }

    return data ? TeacherMapper.toDomain(data) : null;
  }

  public async createTeacherWithInvitationToken(
    adminData: User,
    invitationToken: InvitationToken,
  ): Promise<Teacher> {
    const { firstname, lastname } = adminData.metadata;
    const email = adminData.email;

    const { data, error } = await this.supabase
      .from('teachers')
      .insert(
        invitationTokenMapper.toInsertWithEstablishment(
          adminData.id,
          `${firstname} ${lastname}`,
          email,
          invitationToken.establishmentId,
          invitationToken.assignedChatbots || 0,
        ),
      )
      .select()
      .single();

    if (error) {
      await this.supabaseAuth.auth.admin.deleteUser(adminData.id);
      throw new ServerError(error.message);
    }

    return TeacherMapper.toDomain(data);
  }
}
