import { Inject } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import { Session } from 'src/domain/teaching/session/types/session.type';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';

export class GetTeacherSessionsUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async execute(userId: string): Promise<Session[]> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);

    if (!teacher?.id) {
      throw new NotFoundError(`Teacher with id ${userId} not found`);
    }

    return this.sessionRepository.getSessionsByTeacherId(teacher.id);
  }
}
