import { CreateSelfLearnerUseCase } from './create-self-learner.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { SelfLearner } from 'src/domain/teaching/self-learner/types/self-learner.type';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('CreateSelfLearnerUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create with firstname and lastname combined', async () => {
    fixtures.whenCreateSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.repository.createSelfLearner).toHaveBeenCalledWith({
      supabaseUserId: fixtures.user.id,
      name: 'Jean Dupont',
      email: fixtures.user.email,
    });
  });

  it('should use firstname only when lastname is missing', async () => {
    fixtures.whenCreateSucceeds();
    fixtures.user.metadata = { firstname: 'Jean', role: 'self-learner' };

    await fixtures.whenExecute();

    expect(fixtures.repository.createSelfLearner).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jean' }));
  });

  it('should default name to Apprenant when firstname is missing', async () => {
    fixtures.whenCreateSucceeds();
    fixtures.user.metadata = { lastname: 'Only', role: 'self-learner' };

    await fixtures.whenExecute();

    expect(fixtures.repository.createSelfLearner).toHaveBeenCalledWith(expect.objectContaining({ name: 'Apprenant' }));
  });

  it('should return the created self-learner', async () => {
    fixtures.whenCreateSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.created);
  });

  it('should propagate repository errors', async () => {
    const err = new Error('insert failed');
    fixtures.repository.createSelfLearner.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly user: AuthUser = {
    id: 'sl-user-1',
    email: 'learner@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: {
      firstname: 'Jean',
      lastname: 'Dupont',
      role: 'self-learner',
    },
  };

  public readonly created: SelfLearner = {
    id: 'sl-1',
    supabaseUserId: this.user.id,
    name: 'Jean Dupont',
    email: this.user.email,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly repository: jest.Mocked<ISelfLearnerRepository>;
  public readonly useCase: CreateSelfLearnerUseCase;

  constructor() {
    this.repository = createMockSelfLearnerRepository();
    this.useCase = new CreateSelfLearnerUseCase(this.repository);
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenCreateSucceeds() {
    this.repository.createSelfLearner.mockResolvedValue(this.created);
  }
}
