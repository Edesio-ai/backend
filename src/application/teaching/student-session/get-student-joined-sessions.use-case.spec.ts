import { GetStudentJoinedSessionsUseCase } from './get-student-joined-sessions.use-case';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { StudentJoinedSession } from 'src/domain/teaching/student-session/types/student-session.type';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';

describe('GetStudentJoinedSessionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call studentSessionRepository.listSessionsEnrolledByStudent with the student id', async () => {
    fixtures.whenJoinedSessionsFound();

    await fixtures.whenExecute();

    expect(
      fixtures.studentSessionRepository.listSessionsEnrolledByStudent,
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

  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly useCase: GetStudentJoinedSessionsUseCase;

  constructor() {
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.useCase = new GetStudentJoinedSessionsUseCase(
      this.studentSessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.studentId);
  }

  whenJoinedSessionsFound() {
    this.studentSessionRepository.listSessionsEnrolledByStudent.mockResolvedValue(
      this.joinedSessions,
    );
  }

  whenNoJoinedSessionsFound() {
    this.studentSessionRepository.listSessionsEnrolledByStudent.mockResolvedValue(
      [],
    );
  }

  whenRepositoryThrows(error: Error) {
    this.studentSessionRepository.listSessionsEnrolledByStudent.mockRejectedValue(
      error,
    );
  }
}
