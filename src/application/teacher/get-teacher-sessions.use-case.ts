import { Inject } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from '../../domain/teaching/interface/session.repository';
import { Session } from 'src/domain/teaching/types/session.type';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from '../../domain/teaching/interface/teacher.repository';
import { TeacherNotFoundError } from '../../domain/teaching/error';

export class GetTeacherSessionsUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async execute(userId: string): Promise<Session[]> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);

    if (!teacher?.id) {
      throw new TeacherNotFoundError('Teacher not found');
    }

    return this.sessionRepository.getSessionsByTeacherId(teacher.id);
  }
}
