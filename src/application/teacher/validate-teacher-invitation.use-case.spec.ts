import { InvitationToken } from 'src/domain/auth/invitation.type';
import {
  InvitationTokenAlreadyUsedError,
  InvitationTokenEmailMismatchError,
  InvitationTokenExpiredError,
  InvitationTokenNotFoundError,
} from 'src/domain/auth/errors';
import { TeacherNotFoundError } from 'src/domain/teaching/error';
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

    await expect(promise).rejects.toBeInstanceOf(TeacherNotFoundError);
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

    await expect(promise).rejects.toBeInstanceOf(InvitationTokenNotFoundError);
  });

  it('should throw when invitation token is expired', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationExpired();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(InvitationTokenExpiredError);
  });

  it('should throw when invitation token is already used', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationAlreadyUsed();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(
      InvitationTokenAlreadyUsedError,
    );
  });

  it('should throw when invitation email does not match teacher email', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenInvitationEmailMismatch();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(
      InvitationTokenEmailMismatchError,
    );
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
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: null,
    available_chatbots: 2,
    supabase_user_id: this.userId,
  };
  public readonly invitation: InvitationToken = {
    id: 'invitation-id-1',
    establishment_id: 'establishment-1',
    token: this.token,
    invited_email: this.teacher.email,
    expires_at: '2099-01-01T00:00:00.000Z',
    used_at: null,
    used_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    assigned_chatbots: 2,
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
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(
      this.teacher as any,
    );
  }

  whenTeacherAlreadyAttached() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue({
      ...this.teacher,
      establishment_id: 'est-1',
    } as any);
  }

  whenInvitationNotFound() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue(null as any);
  }

  whenInvitationExpired() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue({
      ...this.invitation,
      expires_at: '2000-01-01T00:00:00.000Z',
    });
  }

  whenInvitationAlreadyUsed() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue({
      ...this.invitation,
      used_at: '2026-01-01T10:00:00.000Z',
    });
  }

  whenInvitationEmailMismatch() {
    this.tokenRepository.getInvitationByToken.mockResolvedValue({
      ...this.invitation,
      invited_email: 'another@school.com',
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
      this.invitation.establishment_id,
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
