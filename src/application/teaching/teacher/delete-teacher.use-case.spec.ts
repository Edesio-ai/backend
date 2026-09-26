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

  it('should delete the auth user then the teacher', async () => {
    fixtures.givenTeacherExists();
    fixtures.whenDeleteSucceeds();

    await fixtures.whenExecute();

    fixtures.thenAuthUserDeletedBeforeTeacher();
  });

  it('should look up the auth user by email when the teacher has no supabase user id', async () => {
    fixtures.givenTeacherExistsWithoutSupabaseUser();
    fixtures.whenAuthUserIdFoundByEmail();
    fixtures.whenDeleteSucceeds();

    await fixtures.whenExecute();

    fixtures.thenAuthUserLookedUpByEmail();
    fixtures.thenAuthUserDeletedBeforeTeacher();
  });

  it('should still delete the teacher when no auth user is found', async () => {
    fixtures.givenTeacherExistsWithoutSupabaseUser();
    fixtures.whenAuthUserIdNotFoundByEmail();
    fixtures.whenDeleteSucceeds();

    await fixtures.whenExecute();

    fixtures.thenDeleteTeacherCalledWithExpectedId();
    fixtures.thenDeleteAuthUserNotCalled();
  });

  it('should throw NotFoundError when teacher does not exist', async () => {
    fixtures.givenTeacherDoesNotExist();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);

    fixtures.thenNothingDeleted();
  });

  it('should not delete the teacher when auth deletion fails', async () => {
    fixtures.givenTeacherExists();
    fixtures.whenDeleteAuthUserFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.authError);

    fixtures.thenDeleteTeacherNotCalled();
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

  whenDeleteSucceeds() {
    this.teacherRepository.deleteTeacher.mockResolvedValue(undefined);
    this.authRepository.deleteAuthUser.mockResolvedValue(undefined);
  }

  whenAuthUserIdFoundByEmail() {
    this.authRepository.getAuthUserIdByEmail.mockResolvedValue(this.supabaseUserId);
  }

  whenAuthUserIdNotFoundByEmail() {
    this.authRepository.getAuthUserIdByEmail.mockResolvedValue(null);
  }

  whenDeleteAuthUserFails() {
    this.authRepository.deleteAuthUser.mockRejectedValue(this.authError);
  }

  thenDeleteTeacherCalledWithExpectedId() {
    expect(this.teacherRepository.getTeacherByConditions).toHaveBeenCalledWith({ id: this.teacherId });
    expect(this.teacherRepository.deleteTeacher).toHaveBeenCalledWith(this.teacherId);
    expect(this.teacherRepository.deleteTeacher).toHaveBeenCalledTimes(1);
  }

  thenAuthUserDeletedBeforeTeacher() {
    expect(this.authRepository.deleteAuthUser).toHaveBeenCalledWith(this.supabaseUserId);
    expect(this.authRepository.deleteAuthUser).toHaveBeenCalledTimes(1);
    this.thenDeleteTeacherCalledWithExpectedId();
    expect(this.authRepository.deleteAuthUser.mock.invocationCallOrder[0]).toBeLessThan(
      this.teacherRepository.deleteTeacher.mock.invocationCallOrder[0],
    );
  }

  thenAuthUserLookedUpByEmail() {
    expect(this.authRepository.getAuthUserIdByEmail).toHaveBeenCalledWith(this.teacher.email);
  }

  thenDeleteAuthUserNotCalled() {
    expect(this.authRepository.deleteAuthUser).not.toHaveBeenCalled();
  }

  thenDeleteTeacherNotCalled() {
    expect(this.teacherRepository.deleteTeacher).not.toHaveBeenCalled();
  }

  thenNothingDeleted() {
    this.thenDeleteTeacherNotCalled();
    this.thenDeleteAuthUserNotCalled();
    expect(this.authRepository.getAuthUserIdByEmail).not.toHaveBeenCalled();
  }
}
