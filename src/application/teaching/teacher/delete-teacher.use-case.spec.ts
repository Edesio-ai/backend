import { DeleteTeacherUseCase } from './delete-teacher.use-case';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('DeleteTeacherUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete teacher with expected id', async () => {
    fixtures.whenDeleteTeacherSucceeds();

    await fixtures.whenExecute();

    fixtures.thenDeleteTeacherCalledWithExpectedId();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenDeleteTeacherFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly teacherId = 'teacher-1';
  public readonly repositoryError = new Error('delete failed');

  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly useCase: DeleteTeacherUseCase;

  constructor() {
    this.teacherRepository = createMockTeacherRepository();
    this.useCase = new DeleteTeacherUseCase(this.teacherRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.teacherId);
  }

  whenDeleteTeacherSucceeds() {
    this.teacherRepository.deleteTeacher.mockResolvedValue(undefined);
  }

  whenDeleteTeacherFails() {
    this.teacherRepository.deleteTeacher.mockRejectedValue(this.repositoryError);
  }

  thenDeleteTeacherCalledWithExpectedId() {
    expect(this.teacherRepository.deleteTeacher).toHaveBeenCalledWith(this.teacherId);
    expect(this.teacherRepository.deleteTeacher).toHaveBeenCalledTimes(1);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
