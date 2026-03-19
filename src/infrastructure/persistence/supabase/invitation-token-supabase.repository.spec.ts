import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseInvitationTokenRepository } from './invitation-token-supabase.repository';
import { InvitationTokenPreview } from 'src/domain/auth/invitation.type';

describe('SupabaseInvitationTokenRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return mapped preview when token is valid', async () => {
    fixtures.whenSupabaseReturnsData();

    const result = await fixtures.whenGetInvitationPreview();

    fixtures.thenQueryIsBuiltWithToken();
    fixtures.thenReturnExpectedPreview(result);
  });

  it('should throw NotFoundException when supabase returns error', async () => {
    fixtures.whenSupabaseReturnsError();

    const promise = fixtures.whenGetInvitationPreview();

    await fixtures.thenThrowNotFound(promise);
  });

  it('should throw BadRequestException when token already used', async () => {
    fixtures.whenTokenAlreadyUsed();

    const promise = fixtures.whenGetInvitationPreview();

    await fixtures.thenThrowAlreadyUsed(promise);
  });

  it('should throw BadRequestException when token is expired', async () => {
    fixtures.whenTokenExpired();

    const promise = fixtures.whenGetInvitationPreview();

    await fixtures.thenThrowExpired(promise);
  });
});


class Fixtures {
  public readonly token = 'token-123';

  public readonly preview: InvitationTokenPreview = {
    valid: true,
    maskedEmail: 'j**n@acme.com',
    etablissementNom: 'Edesio Academy',
    chatbotsAlloues: 2,
  };

  private readonly validData = {
    id: 'id-1',
    invited_email: 'john@acme.com',
    chatbots_alloues: 2,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    used_at: null,
    etablissements: { nom: 'Edesio Academy' },
  };

  private readonly singleMock = jest.fn();
  private readonly eqMock = jest.fn(() => ({ single: this.singleMock }));
  private readonly selectMock = jest.fn(() => ({ eq: this.eqMock }));
  private readonly fromMock = jest.fn(() => ({ select: this.selectMock }));

  private readonly supabaseAdminMock = {
    from: this.fromMock,
  };

  public readonly sut = new SupabaseInvitationTokenRepository(this.supabaseAdminMock as any);

  whenSupabaseReturnsData() {
    this.singleMock.mockResolvedValue({
      data: this.validData,
      error: null,
    });
  }

  whenSupabaseReturnsError() {
    this.singleMock.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });
  }

  whenTokenAlreadyUsed() {
    this.singleMock.mockResolvedValue({
      data: {
        ...this.validData,
        used_at: new Date().toISOString(),
      },
      error: null,
    });
  }

  whenTokenExpired() {
    this.singleMock.mockResolvedValue({
      data: {
        ...this.validData,
        expires_at: new Date(Date.now() - 60_000).toISOString(),
      },
      error: null,
    });
  }

  whenGetInvitationPreview() {
    return this.sut.getInvitationPreview(this.token);
  }

  thenQueryIsBuiltWithToken() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.selectMock).toHaveBeenCalled();
    expect(this.eqMock).toHaveBeenCalledWith('token', this.token);
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedPreview(result: InvitationTokenPreview) {
    expect(result).toEqual(this.preview);
  }

  async thenThrowNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
  }

  async thenThrowAlreadyUsed(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow('Invitation token already used');
  }

  async thenThrowExpired(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow('Invitation token expired');
  }
}