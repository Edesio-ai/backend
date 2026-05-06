import { InvitationToken } from 'src/domain/auth/invitation.type';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import { TeacherRepository } from 'src/domain/teaching/interface/teacher.repository';
import { TokenRepository } from 'src/domain/token/contract/token.repository';
import { ValidateTeacherInvitationUseCase } from './validate-teacher-invitation.use-case';

describe('ValidateTeacherInvitationUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should return null when teacher is already attached to an establishment', async () => {
    fixtures.whenTeacherAlreadyAttached();

    const result = await fixtures.whenExecute();

    expect(result).toBeNull();
    fixtures.thenInvitationRepositoryNotCalled();
    fixtures.thenTeacherLinkNotCalled();
  });

  it('should throw when invitation token does not exist', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw when invitation token is expired', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationExpired();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(BadRequestError);
    await expect(promise).rejects.toThrow('Invitation token expired');
  });

  it('should throw when invitation token is already used', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationAlreadyUsed();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(BadRequestError);
    await expect(promise).rejects.toThrow('Invitation token already used');
  });

  it('should throw when invitation email does not match teacher email', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationEmailMismatch();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('should mark token as used, link teacher and return invitation on success', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationValid();

    const result = await fixtures.whenExecute();

    fixtures.thenMarkInvitationAsUsedCalled();
    fixtures.thenLinkTeacherToEstablishmentCalled();
    expect(result).toEqual(fixtures.invitation);
  });
});

class Fixtures {
  public readonly userId = 'user-1';
  public readonly token = 'token-123';
  public readonly teacher = {
    id: 'teacher-1',
    name: 'Teacher Name',
    email: 'teacher@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null,
    availableChatbots: 2,
    supabaseUserId: this.userId,
  };
  public readonly invitation: InvitationToken = {
    id: 'invitation-id-1',
    establishmentId: 'establishment-1',
    token: this.token,
    invitedEmail: this.teacher.email,
    expiresAt: '2099-01-01T00:00:00.000Z',
    usedAt: null,
    usedBy: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    assignedChatbots: 2,
  };

  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly tokenRepository: jest.Mocked<TokenRepository>;
  public readonly useCase: ValidateTeacherInvitationUseCase;

  constructor() {
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
      getTeacherByConditions: jest.fn(),
    };
    this.tokenRepository = {
      deleteInvitationToken: jest.fn(),
      getInvitationByToken: jest.fn(),
      markInvitationTokenAsUsed: jest.fn(),
    };
    this.useCase = new ValidateTeacherInvitationUseCase(
      this.teacherRepository,
      this.tokenRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.token);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherAlreadyAttached() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue({
      ...this.teacher,
      establishmentId: 'est-1',
    });
  }

  whenInvitationNotFound() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue(null as any);
  }

  whenInvitationExpired() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue({
      ...this.invitation,
      expiresAt: '2000-01-01T00:00:00.000Z',
    });
  }

  whenInvitationAlreadyUsed() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue({
      ...this.invitation,
      usedAt: '2026-01-01T10:00:00.000Z',
    });
  }

  whenInvitationEmailMismatch() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue({
      ...this.invitation,
      invitedEmail: 'another@school.com',
    });
  }

  whenInvitationValid() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue(
      this.invitation,
    );
    this.tokenRepository.markInvitationTokenAsUsed.mockResolvedValue();
    this.teacherRepository.linkTeacherToEstablishment.mockResolvedValue();
  }

  thenMarkInvitationAsUsedCalled() {
    expect(this.tokenRepository.markInvitationTokenAsUsed).toHaveBeenCalledWith(
      this.invitation.id,
      this.teacher.id,
    );
    expect(
      this.tokenRepository.markInvitationTokenAsUsed,
    ).toHaveBeenCalledTimes(1);
  }

  thenLinkTeacherToEstablishmentCalled() {
    expect(
      this.teacherRepository.linkTeacherToEstablishment,
    ).toHaveBeenCalledWith(
      this.invitation.id,
      this.teacher.id,
      this.invitation.establishmentId,
    );
    expect(
      this.teacherRepository.linkTeacherToEstablishment,
    ).toHaveBeenCalledTimes(1);
  }

  thenInvitationRepositoryNotCalled() {
    expect(this.tokenRepository.getInvitationByToken).not.toHaveBeenCalled();
    expect(
      this.tokenRepository.markInvitationTokenAsUsed,
    ).not.toHaveBeenCalled();
  }

  thenTeacherLinkNotCalled() {
    expect(
      this.teacherRepository.linkTeacherToEstablishment,
    ).not.toHaveBeenCalled();
  }
}
