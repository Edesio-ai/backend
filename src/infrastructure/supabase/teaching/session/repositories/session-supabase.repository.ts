import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../../supabase.module';
import {
  CreateSessionBody,
  SupabaseSession,
  Session,
  UpdateSessionNameBody,
} from 'src/domain/teaching/session/types/session.type';
import { SessionMapper } from '../mappers/session.mapper';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { mapList } from 'src/infrastructure/supabase/common/mapper.util';

export class SupabaseSessionRepository implements ISessionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  async getSessionsByTeacherId(teacherId: string): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ServerError(error.message);
    }

    return (data ?? []).map(SessionMapper.toDomain);
  }

  public async getSessionByCode(code: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('An error occure while getting session by code:', error);
      throw new ServerError(error.message);
    }

    return data ? SessionMapper.toDomain(data) : null;
  }

  public async createSession(body: CreateSessionBody): Promise<Session> {
    const { data, error } = await this.supabase
      .from('sessions')
      .insert(SessionMapper.toInsert(body))
      .select()
      .single();

    if (error) {
      throw new ServerError(error.message);
    }

    return SessionMapper.toDomain(data);
  }

  public async updateSessionName(
    sessionId: string,
    body: UpdateSessionNameBody,
  ): Promise<Session> {
    const { data, error } = await this.supabase
      .from('sessions')
      .update(SessionMapper.toUpdate(body))
      .eq('id', sessionId)
      .eq('teacher_id', body.teacherId)
      .select()
      .single();

    if (error) {
      throw new ServerError(error.message);
    }

    return SessionMapper.toDomain(data);
  }

  async deleteSessionByTeacherId(
    sessionId: string,
    teacherId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('teacher_id', teacherId);

    if (error) {
      throw new ServerError(error.message);
    }
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('id, teacher_id')
      .eq('id', sessionId)
      .single();

    if (error) {
      throw new ServerError(error.message);
    }

    return data ? SessionMapper.toDomain(data as SupabaseSession) : null;
  }

  public async getTeachersSessionsByIds(
    teacherIds: string[],
  ): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('id, name, code, language, teacher_id, created_at')
      .in(
        'teacher_id',
        teacherIds.length > 0
          ? teacherIds
          : ['00000000-0000-0000-0000-000000000000'],
      );

    if (error) {
      throw new ServerError(error.message);
    }
    return mapList(data ?? [], SessionMapper.toDomain);
  }
}
