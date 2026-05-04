import { GetStudentByUserIdUseCase } from './get-student-by-user-id.use-case';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';
import { Student } from '../../domain/teaching/types/student.type';

describe('GetStudentByUserIdUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call studentRepository.getStudentByUserId with the user id', async () => {
    fixtures.whenStudentFound();

    await fixtures.whenExecute();

    expect(fixtures.studentRepository.getStudentByUserId).toHaveBeenCalledWith(
      fixtures.userId,
    );
  });

  it('should return the student when found', async () => {
    fixtures.whenStudentFound();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.student);
  });

  it('should return null when no student is found', async () => {
    fixtures.whenStudentNotFound();

    const result = await fixtures.whenExecute();

    expect(result).toBeNull();
  });

  it('should propagate errors thrown by the repository', async () => {
    fixtures.whenRepositoryThrows(new Error('DB error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('DB error');
  });
});

class Fixtures {
  public readonly userId = 'user-1';

  public readonly student: Student = {
    id: 'student-1',
    supabaseUserId: 'user-1',
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: 'https://x/a.png',
  };

  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: GetStudentByUserIdUseCase;

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
    this.useCase = new GetStudentByUserIdUseCase(this.studentRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.userId);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenRepositoryThrows(error: Error) {
    this.studentRepository.getStudentByUserId.mockRejectedValue(error);
  }
}
