import { GetStudentJoinedSessionsUseCase } from './get-student-joined-sessions.use-case';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';
import { StudentJoinedSession } from '../../domain/teaching/types/student.type';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

describe('GetStudentJoinedSessionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call studentRepository.getStudentJoinedSessions with the student id', async () => {
    fixtures.whenJoinedSessionsFound();

    await fixtures.whenExecute();

    expect(
      fixtures.studentRepository.getStudentJoinedSessions,
    ).toHaveBeenCalledWith(fixtures.studentId);
  });

  it('should return the joined sessions', async () => {
    fixtures.whenJoinedSessionsFound();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.joinedSessions);
  });

  it('should return an empty array when no sessions are found', async () => {
    fixtures.whenNoJoinedSessionsFound();

    const result = await fixtures.whenExecute();

    expect(result).toEqual([]);
  });

  it('should propagate errors thrown by the repository', async () => {
    fixtures.whenRepositoryThrows(new Error('DB error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('DB error');
  });
});

class Fixtures {
  public readonly studentId = 'student-1';

  public readonly joinedSessions: StudentJoinedSession[] = [
    {
      id: 'session-1',
      teacherId: 'teacher-1',
      name: 'Session de maths',
      code: 'ABC123',
      language: 'francais',
      createdAt: '2026-01-01T00:00:00.000Z',
      joinedAt: '2026-01-15T10:00:00.000Z',
    },
  ];

  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: GetStudentJoinedSessionsUseCase;

  constructor() {
    this.studentRepository = createMockStudentRepository();
    this.useCase = new GetStudentJoinedSessionsUseCase(this.studentRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.studentId);
  }

  whenJoinedSessionsFound() {
    this.studentRepository.getStudentJoinedSessions.mockResolvedValue(
      this.joinedSessions,
    );
  }

  whenNoJoinedSessionsFound() {
    this.studentRepository.getStudentJoinedSessions.mockResolvedValue([]);
  }

  whenRepositoryThrows(error: Error) {
    this.studentRepository.getStudentJoinedSessions.mockRejectedValue(error);
  }
}
