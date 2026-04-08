import { GetTeacherByUserIdUseCase } from './get-teacher-by-user-id.use-case';
import { TeacherRepository } from '../../interfaces/persistence/teacher.repository';

describe('GetTeacherByUserIdUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return teacher when repository finds one', async () => {
    fixtures.whenTeacherFound();

    const result = await fixtures.whenExecute();

    fixtures.thenRepositoryCalledWithExpectedUserId();
    fixtures.thenReturnTeacher(result);
  });

  it('should return null when repository returns null', async () => {
    fixtures.whenTeacherNotFound();

    const result = await fixtures.whenExecute();

    fixtures.thenRepositoryCalledWithExpectedUserId();
    expect(result).toBeNull();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenRepositoryFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly userId = 'user-1';
  public readonly teacher = {
    id: 'teacher-1',
    name: 'John Doe',
    email: 'john@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: null,
    available_chatbots: 2,
    supabase_user_id: this.userId,
  };
  public readonly repositoryError = new Error('teacher query failed');

  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly useCase: GetTeacherByUserIdUseCase;

  constructor() {
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
    };
    this.useCase = new GetTeacherByUserIdUseCase(this.teacherRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.userId);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(
      this.teacher as any,
    );
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenRepositoryFails() {
    this.teacherRepository.getTeacherByUserId.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenRepositoryCalledWithExpectedUserId() {
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      this.userId,
    );
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledTimes(1);
  }

  thenReturnTeacher(result: unknown) {
    expect(result).toEqual(this.teacher);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
