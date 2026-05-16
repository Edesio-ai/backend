import { GetEstablishmentsStatsUseCase } from './get-establishment-stats.use-case';
import { IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import type { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';

describe('GetEstablishmentsStatsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should fetch establishment stats and aggregate totals', async () => {
    fixtures.whenRepositoriesReturnData();

    const result = await fixtures.whenExecute();

    fixtures.thenRepositoriesCalledInExpectedOrder();
    fixtures.thenReturnExpectedStats(result);
  });

  it('should propagate repository error when establishment lookup fails', async () => {
    fixtures.whenEstablishmentRepositoryThrowsError();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenDownstreamRepositoriesNotCalled();
  });
});

class Fixtures {
  public readonly establishmentRepository: jest.Mocked<IEstablishmentRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase;

  public readonly userId: string;
  public readonly establishment: any;
  public readonly teachers: any[];
  public readonly sessions: any[];
  public readonly studentSessions: any[];
  public readonly repositoryError: Error;

  constructor() {
    this.establishmentRepository = createMockEstablishmentRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.sessionRepository = createMockSessionRepository();

    this.getEstablishmentsStatsUseCase = new GetEstablishmentsStatsUseCase(
      this.establishmentRepository,
      this.teacherRepository,
      this.studentSessionRepository,
      this.sessionRepository,
    );

    this.userId = 'user-1';
    this.establishment = {
      id: 'est-1',
      supabaseUserId: this.userId,
      name: 'Edesio Academy',
      email: 'stats@edesio.io',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    this.teachers = [
      {
        id: 'teacher-1',
        name: 'Prof 1',
        email: 'p1@school.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        establishmentId: 'est-1',
        availableChatbots: 0,
      },
      {
        id: 'teacher-2',
        name: 'Prof 2',
        email: 'p2@school.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        establishmentId: 'est-1',
        availableChatbots: 0,
      },
    ];
    this.sessions = [
      {
        id: 'session-1',
        name: 'S1',
        code: 'c1',
        language: 'francais',
        teacherId: 'teacher-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'session-2',
        name: 'S2',
        code: 'c2',
        language: 'francais',
        teacherId: 'teacher-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'session-3',
        name: 'S3',
        code: 'c3',
        language: 'francais',
        teacherId: 'teacher-2',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    this.studentSessions = [
      { sessionId: 'session-1', studentId: 'student-1' },
      { sessionId: 'session-2', studentId: 'student-2' },
      { sessionId: 'session-2', studentId: 'student-1' },
    ];
    this.repositoryError = new Error('establishment not found');
  }

  whenExecute() {
    return this.getEstablishmentsStatsUseCase.execute(this.userId);
  }

  whenRepositoriesReturnData() {
    this.establishmentRepository.getEstablishmentByUserId.mockResolvedValue(
      this.establishment,
    );
    this.teacherRepository.getTeacherByEstablishmentId.mockResolvedValue(
      this.teachers,
    );
    this.sessionRepository.getTeachersSessionsByIds.mockResolvedValue(
      this.sessions,
    );
    this.studentSessionRepository.getStudentsSessionsByIds.mockResolvedValue(
      this.studentSessions,
    );
  }

  whenEstablishmentRepositoryThrowsError() {
    this.establishmentRepository.getEstablishmentByUserId.mockRejectedValue(
      this.repositoryError,
    );
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoriesCalledInExpectedOrder() {
    expect(
      this.establishmentRepository.getEstablishmentByUserId,
    ).toHaveBeenCalledWith(this.userId);
    expect(
      this.teacherRepository.getTeacherByEstablishmentId,
    ).toHaveBeenCalledWith(this.establishment.id);
    expect(
      this.sessionRepository.getTeachersSessionsByIds,
    ).toHaveBeenCalledWith(['teacher-1', 'teacher-2']);
    expect(
      this.studentSessionRepository.getStudentsSessionsByIds,
    ).toHaveBeenCalledWith(['session-1', 'session-2', 'session-3']);
  }

  thenDownstreamRepositoriesNotCalled() {
    expect(
      this.teacherRepository.getTeacherByEstablishmentId,
    ).not.toHaveBeenCalled();
    expect(
      this.sessionRepository.getTeachersSessionsByIds,
    ).not.toHaveBeenCalled();
    expect(
      this.studentSessionRepository.getStudentsSessionsByIds,
    ).not.toHaveBeenCalled();
  }

  thenReturnExpectedStats(result: any) {
    expect(result).toEqual({
      establishment: this.establishment,
      teachers: [
        {
          id: 'teacher-1',
          name: 'Prof 1',
          email: 'p1@school.com',
          createdAt: '2026-01-01T00:00:00.000Z',
          establishmentId: 'est-1',
          availableChatbots: 0,
          sessionsCount: 2,
          studentsCount: 3,
          sessions: [
            {
              id: 'session-1',
              name: 'S1',
              code: 'c1',
              language: 'francais',
              teacherId: 'teacher-1',
              createdAt: '2026-01-01T00:00:00.000Z',
              studentsCount: 1,
            },
            {
              id: 'session-2',
              name: 'S2',
              code: 'c2',
              language: 'francais',
              teacherId: 'teacher-1',
              createdAt: '2026-01-01T00:00:00.000Z',
              studentsCount: 2,
            },
          ],
        },
        {
          id: 'teacher-2',
          name: 'Prof 2',
          email: 'p2@school.com',
          createdAt: '2026-01-01T00:00:00.000Z',
          establishmentId: 'est-1',
          availableChatbots: 0,
          sessionsCount: 1,
          studentsCount: 0,
          sessions: [
            {
              id: 'session-3',
              name: 'S3',
              code: 'c3',
              language: 'francais',
              teacherId: 'teacher-2',
              createdAt: '2026-01-01T00:00:00.000Z',
              studentsCount: 0,
            },
          ],
        },
      ],
      stats: {
        totalTeachers: 2,
        totalSessions: 3,
        totalStudents: 2,
      },
    });
  }
}
