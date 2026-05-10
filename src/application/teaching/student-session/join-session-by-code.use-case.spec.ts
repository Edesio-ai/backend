import { JoinSessionByCodeUseCase } from './join-session-by-code.use-case';
import { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import {
  BadRequestError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import { Session } from 'src/domain/teaching/session/types/session.type';
import {
  Student,
  StudentJoinedSession,
} from 'src/domain/teaching/student/type/student.type';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';

describe('JoinSessionByCodeUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when the session code does not exist', async () => {
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw NotFoundError when the student is not found', async () => {
    fixtures.whenSessionFound();
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw BadRequestError when the student already joined the session', async () => {
    fixtures.whenSessionFound();
    fixtures.whenStudentFound();
    fixtures.whenStudentAlreadyJoinedSession();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('should throw BadRequestError with correct message when already joined', async () => {
    fixtures.whenSessionFound();
    fixtures.whenStudentFound();
    fixtures.whenStudentAlreadyJoinedSession();

    await expect(fixtures.whenExecute()).rejects.toThrow(
      'Student already joined this session',
    );
  });

  it('should call createStudentSession with the correct student id and session id', async () => {
    fixtures.whenSessionFound();
    fixtures.whenStudentFound();
    fixtures.whenStudentHasNoJoinedSessions();
    fixtures.whenCreateStudentSessionSucceeds();

    await fixtures.whenExecute();

    expect(
      fixtures.studentSessionRepository.createStudentSession,
    ).toHaveBeenCalledWith(fixtures.student.id, fixtures.session.id);
  });

  it('should propagate errors thrown by createStudentSession', async () => {
    fixtures.whenSessionFound();
    fixtures.whenStudentFound();
    fixtures.whenStudentHasNoJoinedSessions();
    fixtures.whenCreateStudentSessionFails(new Error('DB error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('DB error');
  });
});

class Fixtures {
  public readonly code = 'ABC123';
  public readonly userId = 'user-1';

  public readonly session: Session = {
    id: 'session-1',
    teacherId: 'teacher-1',
    name: 'Session de maths',
    code: this.code,
    language: 'francais',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly student: Student = {
    id: 'student-1',
    supabaseUserId: this.userId,
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: 'https://x/a.png',
  };

  public readonly alreadyJoinedSession: StudentJoinedSession = {
    id: this.session.id,
    teacherId: this.session.teacherId,
    name: this.session.name,
    code: this.session.code,
    language: this.session.language,
    createdAt: this.session.createdAt,
    joinedAt: '2026-01-10T00:00:00.000Z',
  };

  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly studentSessionRepository: ReturnType<
    typeof createMockStudentSessionRepository
  >;
  public readonly useCase: JoinSessionByCodeUseCase;

  constructor() {
    this.studentRepository = createMockStudentRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.sessionRepository = {
      getSessionByCode: jest.fn(),
      getSessionsByTeacherId: jest.fn(),
      createSession: jest.fn(),
      updateSessionName: jest.fn(),
      deleteSessionByTeacherId: jest.fn(),
      getSessionById: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
    };
    this.useCase = new JoinSessionByCodeUseCase(
      this.studentRepository,
      this.sessionRepository,
      this.studentSessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.code, this.userId);
  }

  whenSessionFound() {
    this.sessionRepository.getSessionByCode.mockResolvedValue(this.session);
  }

  whenSessionNotFound() {
    this.sessionRepository.getSessionByCode.mockResolvedValue(null);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenStudentAlreadyJoinedSession() {
    this.studentSessionRepository.listSessionsEnrolledByStudent.mockResolvedValue(
      [this.alreadyJoinedSession],
    );
  }

  whenStudentHasNoJoinedSessions() {
    this.studentSessionRepository.listSessionsEnrolledByStudent.mockResolvedValue(
      [],
    );
  }

  whenCreateStudentSessionSucceeds() {
    this.studentSessionRepository.createStudentSession.mockResolvedValue(
      undefined,
    );
  }

  whenCreateStudentSessionFails(error: Error) {
    this.studentSessionRepository.createStudentSession.mockRejectedValue(error);
  }
}
