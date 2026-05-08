import { CreateTeacherUseCase } from './create-teacher.use-case';
import { TeacherRepository } from 'src/domain/teaching/interface/teacher.repository';

describe('CreateTeacherUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create teacher with expected payload', async () => {
    fixtures.whenCreateTeacherSucceeds();

    const result = await fixtures.whenExecute();

    fixtures.thenCreateTeacherCalledWithExpectedArguments();
    fixtures.thenReturnCreatedTeacher(result);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenCreateTeacherFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly userId = 'user-1';
  public readonly body = {
    name: 'John Doe',
    email: 'john@school.com',
  };
  public readonly createdTeacher = {
    id: 'teacher-1',
    name: this.body.name,
    email: this.body.email,
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null,
    availableChatbots: 2,
    supabaseUserId: this.userId,
  };
  public readonly repositoryError = new Error('insert failed');

  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly useCase: CreateTeacherUseCase;

  constructor() {
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
      getTeacherByConditions: jest.fn(),
    };

    this.useCase = new CreateTeacherUseCase(this.teacherRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.body);
  }

  whenCreateTeacherSucceeds() {
    this.teacherRepository.createTeacher.mockResolvedValue(this.createdTeacher);
  }

  whenCreateTeacherFails() {
    this.teacherRepository.createTeacher.mockRejectedValue(
      this.repositoryError,
    );
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenCreateTeacherCalledWithExpectedArguments() {
    expect(this.teacherRepository.createTeacher).toHaveBeenCalledWith(
      this.userId,
      this.body.name,
      this.body.email,
    );
    expect(this.teacherRepository.createTeacher).toHaveBeenCalledTimes(1);
  }

  thenReturnCreatedTeacher(result: unknown) {
    expect(result).toEqual(this.createdTeacher);
  }
}
