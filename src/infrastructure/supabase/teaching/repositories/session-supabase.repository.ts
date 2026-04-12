import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { SessionRepository } from '../../../../domain/teaching/interface/session.repository';
import {
  CreateSessionBody,
  Session,
  UpdateSessionNameBody,
} from '../../../../domain/teaching/types/session.type';
import { SessionServerError } from '../../../../domain/teaching/error';
import {
  createSessionBodyToSupabaseSessionInsert,
  supabaseSessionToSession,
  updateSessionNameBodyToSupabaseSessionUpdate,
} from '../mappers/session.mapper';

export class SupabaseSessionRepository implements SessionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  async getSessionsByTeacherId(teacherId: string): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new SessionServerError(error.message);
    }

    return (data ?? []).map(supabaseSessionToSession);
  }

  public async getSessionByCode(code: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('An error occure while getting session by code:', error);
      throw new SessionServerError(error.message);
    }

    if (!data) {
      return null;
    }

    return supabaseSessionToSession(data);
  }

  public async createSession(body: CreateSessionBody): Promise<Session> {
    const { data, error } = await this.supabase
      .from('sessions')
      .insert(createSessionBodyToSupabaseSessionInsert(body))
      .select()
      .single();

    if (error) {
      throw new SessionServerError(error.message);
    }

    return supabaseSessionToSession(data);
  }

  public async updateSessionName(
    sessionId: string,
    body: UpdateSessionNameBody,
  ): Promise<Session> {
    const { data, error } = await this.supabase
      .from('sessions')
      .update(updateSessionNameBodyToSupabaseSessionUpdate(body))
      .eq('id', sessionId)
      .eq('teacher_id', body.teacherId)
      .select()
      .single();

    if (error) {
      throw new SessionServerError(error.message);
    }

    return supabaseSessionToSession(data);
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
      throw new SessionServerError(error.message);
    }
  }
}
