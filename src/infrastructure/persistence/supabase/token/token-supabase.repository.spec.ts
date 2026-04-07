import { TokenSupabaseRepository } from './token-supabase.repository';
import { ServerTokenError } from '../../../../domain/token/token.error';

describe('TokenSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete invitation token when query succeeds', async () => {
    fixtures.whenSupabaseDeleteSucceeds();

    await fixtures.whenDeleteInvitationToken();

    fixtures.thenQueryBuiltWithExpectedArguments();
  });

  it('should throw ServerTokenError when query fails', async () => {
    fixtures.whenSupabaseDeleteFails();

    const promise = fixtures.whenDeleteInvitationToken();

    await fixtures.thenThrowServerTokenError(promise);
    fixtures.thenQueryBuiltWithExpectedArguments();
  });
});

class Fixtures {
  public readonly token = 'token-id-1';
  public readonly queryErrorMessage = 'delete failed';

  private readonly eqMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({ eq: this.eqMock }));
  private readonly fromMock = jest.fn(() => ({ delete: this.deleteMock }));

  public readonly repository: TokenSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new TokenSupabaseRepository(supabaseMock as never);
  }

  whenDeleteInvitationToken() {
    return this.repository.deleteInvitationToken(this.token);
  }

  whenSupabaseDeleteSucceeds() {
    this.eqMock.mockResolvedValue({
      error: null,
    });
  }

  whenSupabaseDeleteFails() {
    this.eqMock.mockResolvedValue({
      error: { message: this.queryErrorMessage },
    });
  }

  async thenThrowServerTokenError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerTokenError);
    await expect(promise).rejects.toThrow(this.queryErrorMessage);
  }

  thenQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.deleteMock).toHaveBeenCalledWith();
    expect(this.eqMock).toHaveBeenCalledWith('id', this.token);
    expect(this.eqMock).toHaveBeenCalledTimes(1);
  }
}
