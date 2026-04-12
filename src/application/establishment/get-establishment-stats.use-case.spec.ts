import { GetEstablishmentsStatsUseCase } from './get-establishment-stats.use-case';
import { EstablishmentRepository } from '../../domain/teaching/interface/establishment.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';

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
  public readonly establishmentRepository: jest.Mocked<EstablishmentRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase;

  public readonly userId: string;
  public readonly establishment: any;
  public readonly teachers: any[];
  public readonly sessions: any[];
  public readonly studentSessions: any[];
  public readonly repositoryError: Error;

  constructor() {
    this.establishmentRepository = {
      getEstablishmentById: jest.fn(),
      getEstablishmentByUserId: jest.fn(),
      createEstablishment: jest.fn(),
      getInvitationTokenByEstablishmentId: jest.fn(),
    };
    this.teacherRepository = {
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      linkTeacherToEstablishment: jest.fn(),
      createTeacher: jest.fn(),
    };
    this.studentRepository = {
      getStudentsSessionsByIds: jest.fn(),
      deleteStudentSessionsBySessionId: jest.fn(),
    };

    this.getEstablishmentsStatsUseCase = new GetEstablishmentsStatsUseCase(
      this.establishmentRepository,
      this.studentRepository,
      this.teacherRepository,
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
      { id: 'teacher-1', name: 'Prof 1' },
      { id: 'teacher-2', name: 'Prof 2' },
    ];
    this.sessions = [
      { id: 'session-1', teacher_id: 'teacher-1' },
      { id: 'session-2', teacher_id: 'teacher-1' },
      { id: 'session-3', teacher_id: 'teacher-2' },
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
    this.teacherRepository.getTeachersSessionsByIds.mockResolvedValue(
      this.sessions,
    );
    this.studentRepository.getStudentsSessionsByIds.mockResolvedValue(
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
      this.teacherRepository.getTeachersSessionsByIds,
    ).toHaveBeenCalledWith(['teacher-1', 'teacher-2']);
    expect(
      this.studentRepository.getStudentsSessionsByIds,
    ).toHaveBeenCalledWith(['session-1', 'session-2', 'session-3']);
  }

  thenDownstreamRepositoriesNotCalled() {
    expect(
      this.teacherRepository.getTeacherByEstablishmentId,
    ).not.toHaveBeenCalled();
    expect(
      this.teacherRepository.getTeachersSessionsByIds,
    ).not.toHaveBeenCalled();
    expect(
      this.studentRepository.getStudentsSessionsByIds,
    ).not.toHaveBeenCalled();
  }

  thenReturnExpectedStats(result: any) {
    expect(result).toEqual({
      establishment: this.establishment,
      teachers: [
        {
          id: 'teacher-1',
          name: 'Prof 1',
          sessions_count: 2,
          students_count: 3,
          sessions: [
            { id: 'session-1', teacher_id: 'teacher-1', students_count: 1 },
            { id: 'session-2', teacher_id: 'teacher-1', students_count: 2 },
          ],
        },
        {
          id: 'teacher-2',
          name: 'Prof 2',
          sessions_count: 1,
          students_count: 0,
          sessions: [
            { id: 'session-3', teacher_id: 'teacher-2', students_count: 0 },
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
