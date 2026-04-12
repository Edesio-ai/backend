import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { SessionRepository } from '../../../../domain/teaching/interface/session.repository';
import {
  CreateSessionBody,
  Session,
  UpdateSessionNameBody,
} from '../../../../domain/teaching/types/session.type';
import { SessionServerError } from '../../../../domain/teaching/error';

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

    return data;
  }

  public async getSessionByCode(code: string): Promise<Session> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      throw new SessionServerError(error.message);
    }

    return data;
  }

  public async createSession(body: CreateSessionBody): Promise<Session> {
    const { teacherId, name, code, language } = body;

    const { data, error } = await this.supabase
      .from('sessions')
      .insert({
        teacher_id: teacherId,
        name,
        code,
        language,
      })
      .select()
      .single();

    if (error) {
      throw new SessionServerError(error.message);
    }

    return data;
  }

  public async updateSessionName(
    sessionId: string,
    body: UpdateSessionNameBody,
  ): Promise<Session> {
    const { name, teacherId } = body;

    const { data, error } = await this.supabase
      .from('sessions')
      .update({ name })
      .eq('id', sessionId)
      .eq('teacher_id', teacherId)
      .select()
      .single();

    if (error) {
      throw new SessionServerError(error.message);
    }

    return data;
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
