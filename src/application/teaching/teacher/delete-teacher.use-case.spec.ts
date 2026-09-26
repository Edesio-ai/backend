import { DeleteTeacherUseCase } from './delete-teacher.use-case';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import { Teacher } from 'src/domain/teaching/teacher/types/teacher.type';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';

describe('DeleteTeacherUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete teacher and its auth user', async () => {
    fixtures.givenTeacherExists();
    fixtures.whenDeleteTeacherSucceeds();

    await fixtures.whenExecute();

    fixtures.thenDeleteTeacherCalledWithExpectedId();
    fixtures.thenDeleteAuthUserCalledWithSupabaseUserId();
  });

  it('should not delete any auth user when teacher has no supabase user', async () => {
    fixtures.givenTeacherExistsWithoutSupabaseUser();
    fixtures.whenDeleteTeacherSucceeds();

    await fixtures.whenExecute();

    fixtures.thenDeleteTeacherCalledWithExpectedId();
    fixtures.thenDeleteAuthUserNotCalled();
  });

  it('should throw NotFoundError when teacher does not exist', async () => {
    fixtures.givenTeacherDoesNotExist();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);

    fixtures.thenNothingDeleted();
  });

  it('should propagate repository errors without deleting auth user', async () => {
    fixtures.givenTeacherExists();
    fixtures.whenDeleteTeacherFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.repositoryError);

    fixtures.thenDeleteAuthUserNotCalled();
  });

  it('should propagate auth repository errors', async () => {
    fixtures.givenTeacherExists();
    fixtures.whenDeleteTeacherSucceeds();
    fixtures.whenDeleteAuthUserFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.authError);
  });
});

class Fixtures {
  public readonly teacherId = 'teacher-1';
  public readonly supabaseUserId = 'user-1';
  public readonly repositoryError = new Error('delete failed');
  public readonly authError = new Error('auth delete failed');

  private readonly teacher: Teacher = {
    id: this.teacherId,
    name: 'Camille Bernard',
    email: 'camille@school.com',
    createdAt: '2026-09-23T12:00:00+00:00',
    establishmentId: 'est-1',
    availableChatbots: 0,
    supabaseUserId: this.supabaseUserId,
  };

  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly useCase: DeleteTeacherUseCase;

  constructor() {
    this.teacherRepository = createMockTeacherRepository();
    this.authRepository = createMockAuthRepository();
    this.useCase = new DeleteTeacherUseCase(this.teacherRepository, this.authRepository);
  }

  givenTeacherExists() {
    this.teacherRepository.getTeacherByConditions.mockResolvedValue(this.teacher);
  }

  givenTeacherExistsWithoutSupabaseUser() {
    this.teacherRepository.getTeacherByConditions.mockResolvedValue({ ...this.teacher, supabaseUserId: null });
  }

  givenTeacherDoesNotExist() {
    this.teacherRepository.getTeacherByConditions.mockResolvedValue(null);
  }

  whenExecute() {
    return this.useCase.execute(this.teacherId);
  }

  whenDeleteTeacherSucceeds() {
    this.teacherRepository.deleteTeacher.mockResolvedValue(undefined);
    this.authRepository.deleteAuthUser.mockResolvedValue(undefined);
  }

  whenDeleteTeacherFails() {
    this.teacherRepository.deleteTeacher.mockRejectedValue(this.repositoryError);
  }

  whenDeleteAuthUserFails() {
    this.authRepository.deleteAuthUser.mockRejectedValue(this.authError);
  }

  thenDeleteTeacherCalledWithExpectedId() {
    expect(this.teacherRepository.getTeacherByConditions).toHaveBeenCalledWith({ id: this.teacherId });
    expect(this.teacherRepository.deleteTeacher).toHaveBeenCalledWith(this.teacherId);
    expect(this.teacherRepository.deleteTeacher).toHaveBeenCalledTimes(1);
  }

  thenDeleteAuthUserCalledWithSupabaseUserId() {
    expect(this.authRepository.deleteAuthUser).toHaveBeenCalledWith(this.supabaseUserId);
    expect(this.authRepository.deleteAuthUser).toHaveBeenCalledTimes(1);
  }

  thenDeleteAuthUserNotCalled() {
    expect(this.authRepository.deleteAuthUser).not.toHaveBeenCalled();
  }

  thenNothingDeleted() {
    expect(this.teacherRepository.deleteTeacher).not.toHaveBeenCalled();
    this.thenDeleteAuthUserNotCalled();
  }
}
