import {
  GetStudentBatchUseCase,
  GetStudentBatchBody,
} from './get-student-batch.use-case';
import { StudentRepository } from 'src/domain/teaching/interface/student.repository';
import { Student } from 'src/domain/teaching/types/student.type';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

describe('GetStudentBatchUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call studentRepository.getStudentsByIds with the provided ids', async () => {
    fixtures.whenStudentsFound();

    await fixtures.whenExecute();

    expect(fixtures.studentRepository.getStudentsByIds).toHaveBeenCalledWith(
      fixtures.body.studentIds,
    );
  });

  it('should return the students matching the provided ids', async () => {
    fixtures.whenStudentsFound();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.students);
  });

  it('should return an empty array when no students match', async () => {
    fixtures.whenNoStudentsFound();

    const result = await fixtures.whenExecute();

    expect(result).toEqual([]);
  });

  it('should propagate errors thrown by the repository', async () => {
    fixtures.whenRepositoryThrows(new Error('DB error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('DB error');
  });
});

class Fixtures {
  public readonly body: GetStudentBatchBody = {
    studentIds: ['student-1', 'student-2'],
  };

  public readonly students: Student[] = [
    {
      id: 'student-1',
      supabaseUserId: 'user-1',
      name: 'Alice Dupont',
      email: 'alice@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      photoUrl: 'https://x/a.png',
    },
    {
      id: 'student-2',
      supabaseUserId: 'user-2',
      name: 'Bob Martin',
      email: 'bob@school.com',
      createdAt: '2026-01-02T00:00:00.000Z',
      photoUrl: '',
    },
  ];

  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: GetStudentBatchUseCase;

  constructor() {
    this.studentRepository = createMockStudentRepository();
    this.useCase = new GetStudentBatchUseCase(this.studentRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.body);
  }

  whenStudentsFound() {
    this.studentRepository.getStudentsByIds.mockResolvedValue(this.students);
  }

  whenNoStudentsFound() {
    this.studentRepository.getStudentsByIds.mockResolvedValue([]);
  }

  whenRepositoryThrows(error: Error) {
    this.studentRepository.getStudentsByIds.mockRejectedValue(error);
  }
}
