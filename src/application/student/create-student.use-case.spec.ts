import { CreateStudentUseCase } from './create-student.use-case';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';
import { AuthUser } from '../../domain/auth/types/auth.type';
import { Student } from '../../domain/teaching/types/student.type';

describe('CreateStudentUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call studentRepository.createStudent with the auth user', async () => {
    fixtures.whenCreateStudentSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.studentRepository.createStudent).toHaveBeenCalledWith(
      fixtures.user,
    );
  });

  it('should return the created student', async () => {
    fixtures.whenCreateStudentSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.createdStudent);
  });

  it('should propagate errors thrown by the repository', async () => {
    fixtures.whenCreateStudentFails(new Error('DB error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('DB error');
  });
});

class Fixtures {
  public readonly user: AuthUser = {
    id: 'user-1',
    email: 'alice@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { firstname: 'Alice', lastname: 'Dupont', role: 'student' },
  };

  public readonly createdStudent: Student = {
    id: 'student-1',
    supabaseUserId: 'user-1',
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: CreateStudentUseCase;

  constructor() {
    this.studentRepository = {
      createStudent: jest.fn(),
      getStudentByUserId: jest.fn(),
      getStudentsSessionsByIds: jest.fn(),
      deleteStudentSessionsBySessionId: jest.fn(),
      getStudentStatsByCourseId: jest.fn(),
      deleteStudentCourseStatsByCourseId: jest.fn(),
      getStudentJoinedSessions: jest.fn(),
      createStudentSession: jest.fn(),
      storeStudentPhoto: jest.fn(),
      updateStudentPhoto: jest.fn(),
    };
    this.useCase = new CreateStudentUseCase(this.studentRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenCreateStudentSucceeds() {
    this.studentRepository.createStudent.mockResolvedValue(this.createdStudent);
  }

  whenCreateStudentFails(error: Error) {
    this.studentRepository.createStudent.mockRejectedValue(error);
  }
}
