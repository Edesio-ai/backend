import { GetSelfLearnerUseCase } from './get-self-learner.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { SelfLearner } from 'src/domain/teaching/self-learner/types/self-learner.type';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('GetSelfLearnerUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return self-learner when repository finds one', async () => {
    fixtures.whenLearnerFound();

    const result = await fixtures.whenExecute();

    expect(fixtures.repository.getSelfLearnerByUserId).toHaveBeenCalledWith(fixtures.user.id);
    expect(result).toEqual(fixtures.learner);
  });

  it('should return null when repository returns null', async () => {
    fixtures.whenLearnerNotFound();

    const result = await fixtures.whenExecute();

    expect(fixtures.repository.getSelfLearnerByUserId).toHaveBeenCalledWith(fixtures.user.id);
    expect(result).toBeNull();
  });

  it('should propagate repository errors', async () => {
    const err = new Error('query failed');
    fixtures.repository.getSelfLearnerByUserId.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly user: AuthUser = {
    id: 'sl-user-1',
    email: 'learner@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'self-learner', firstname: 'Jean', lastname: 'D' },
  };

  public readonly learner: SelfLearner = {
    id: 'sl-1',
    supabaseUserId: this.user.id,
    name: 'Jean D',
    email: this.user.email,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly repository: jest.Mocked<ISelfLearnerRepository>;
  public readonly useCase: GetSelfLearnerUseCase;

  constructor() {
    this.repository = createMockSelfLearnerRepository();
    this.useCase = new GetSelfLearnerUseCase(this.repository);
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenLearnerFound() {
    this.repository.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenLearnerNotFound() {
    this.repository.getSelfLearnerByUserId.mockResolvedValue(null);
  }
}
