import {
  UpdateProfilePayload,
  UpdateProfileUseCase,
} from 'src/application/profile/update-profile.use-case';
import type { IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import type { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import type { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { createMockAuthRepository } from 'src/testing/mock-auth-repository';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('UpdateProfileUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('updates Supabase auth and teacher row when role is teacher', async () => {
    await fixtures.whenExecute();

    expect(fixtures.authRepository.updateAuthUser).toHaveBeenCalledWith(
      fixtures.userId,
      {
        email: 'NEW@School.com ',
        metadata: {
          role: 'teacher',
          firstname: 'Ann',
          lastname: 'Other',
          email: 'new@school.com',
        },
      },
    );
    expect(fixtures.teacherRepository.updateTeacher).toHaveBeenCalledWith(
      fixtures.userId,
      {
        name: 'Ann Other',
        email: 'new@school.com',
      },
    );
    expect(
      fixtures.establishmentRepository.updateEstablishment,
    ).not.toHaveBeenCalled();
    expect(fixtures.studentRepository.updateStudent).not.toHaveBeenCalled();
  });

  it('updates establishment row when role is establishment', async () => {
    fixtures.givenEstablishmentRole();

    await fixtures.whenExecute();

    expect(fixtures.authRepository.updateAuthUser).toHaveBeenCalled();
    expect(
      fixtures.establishmentRepository.updateEstablishment,
    ).toHaveBeenCalledWith(fixtures.userId, {
      name: 'Ann Other',
      email: 'new@school.com',
    });
    expect(fixtures.teacherRepository.updateTeacher).not.toHaveBeenCalled();
    expect(fixtures.studentRepository.updateStudent).not.toHaveBeenCalled();
  });

  it('updates student row when role is student', async () => {
    fixtures.givenStudentRole();

    await fixtures.whenExecute();

    expect(fixtures.authRepository.updateAuthUser).toHaveBeenCalled();
    expect(fixtures.studentRepository.updateStudent).toHaveBeenCalledWith(
      fixtures.userId,
      {
        name: 'Ann Other',
        email: 'new@school.com',
      },
    );
    expect(fixtures.teacherRepository.updateTeacher).not.toHaveBeenCalled();
    expect(
      fixtures.establishmentRepository.updateEstablishment,
    ).not.toHaveBeenCalled();
  });

  it('does not set metadata email when payload email equals user email', async () => {
    fixtures.user.email = 'same@school.com';
    fixtures.payload.email = 'same@school.com';

    await fixtures.whenExecute();

    expect(fixtures.authRepository.updateAuthUser).toHaveBeenCalledWith(
      fixtures.userId,
      {
        email: 'same@school.com',
        metadata: {
          role: 'teacher',
          firstname: 'Ann',
          lastname: 'Other',
        },
      },
    );
  });

  it('propagates errors from auth repository', async () => {
    const err = new Error('auth update failed');
    fixtures.authRepository.updateAuthUser.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
    expect(fixtures.teacherRepository.updateTeacher).not.toHaveBeenCalled();
  });

  it('propagates errors from teacher repository', async () => {
    const err = new Error('teacher update failed');
    fixtures.teacherRepository.updateTeacher.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'user-prof-1';

  public payload: UpdateProfilePayload = {
    firstname: 'Ann',
    lastname: 'Other',
    email: 'NEW@School.com ',
  };

  public user: AuthUser = {
    id: this.userId,
    email: 'old@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: {
      role: 'teacher',
      firstname: 'Old',
      lastname: 'Name',
    },
  };

  public readonly authRepository: jest.Mocked<IAuthRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly establishmentRepository: jest.Mocked<IEstablishmentRepository>;
  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly useCase: UpdateProfileUseCase;

  constructor() {
    this.authRepository = createMockAuthRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.establishmentRepository = createMockEstablishmentRepository();
    this.studentRepository = createMockStudentRepository();

    this.useCase = new UpdateProfileUseCase(
      this.authRepository,
      this.teacherRepository,
      this.establishmentRepository,
      this.studentRepository,
    );

    this.authRepository.updateAuthUser.mockResolvedValue(undefined);
    this.teacherRepository.updateTeacher.mockResolvedValue(undefined);
    this.establishmentRepository.updateEstablishment.mockResolvedValue(
      undefined,
    );
    this.studentRepository.updateStudent.mockResolvedValue(undefined);
  }

  givenEstablishmentRole() {
    this.user.metadata.role = 'establishment';
  }

  givenStudentRole() {
    this.user.metadata.role = 'student';
  }

  whenExecute() {
    return this.useCase.execute(this.user, this.payload);
  }
}
