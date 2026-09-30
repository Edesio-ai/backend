import { Inject } from '@nestjs/common';
import { Session, UpdateSessionNameInput } from 'src/domain/teaching/session/types/session.type';
import {
  SESSION_REPOSITORY,
  type ISessionRepository,
} from 'src/domain/teaching/session/contracts/i-session.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';

export class UpdateSessionNameUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  async execute(sessionId: string, userId: string, body: UpdateSessionNameInput): Promise<Session> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);

    if (!teacher?.id) {
      throw new NotFoundError(`Teacher with id ${userId} not found`);
    }

    return await this.sessionRepository.updateSessionName(sessionId, {
      ...body,
      teacherId: teacher.id,
    });
  }
}
