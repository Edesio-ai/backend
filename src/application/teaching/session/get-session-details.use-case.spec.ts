import { GetSessionDetailsUseCase } from './get-session-details.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import { CourseRepository } from 'src/domain/teaching/interfaces/course.repository';
import { EstablishmentRepository } from 'src/domain/teaching/interfaces/establishment.repository';
import { FileRepository } from 'src/domain/teaching/interfaces/file.repository';
import { QuestionsRepository } from 'src/domain/teaching/interfaces/questions.repository';
import { StudentRepository } from 'src/domain/teaching/interfaces/student.repository';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockFileRepository } from 'src/testing/mock-file-repository';
import { createMockQuestionsRepository } from 'src/testing/mock-questions-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';

describe('GetSessionDetailsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when establishment is not found', async () => {
    fixtures.whenEstablishmentNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.coursesRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when course is not found', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenCourseNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when course belongs to a different establishment', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenCourseFoundWithDifferentEstablishment();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.questionsRepository.getCourseQuestions,
    ).not.toHaveBeenCalled();
  });

  it('should return full course details when all data is found', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenCourseFound();
    fixtures.whenQuestionsFound();
    fixtures.whenStudentsFound();
    fixtures.whenFilesFound();

    const result = await fixtures.whenExecute();

    fixtures.thenCourseDetailsReturned(result);
    fixtures.thenAllRepositoriesCalledWithCourseId();
  });

  it('should return empty arrays when no questions, students, or files', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenCourseFound();
    fixtures.whenNoQuestionsFound();
    fixtures.whenNoStudentsFound();
    fixtures.whenNoFilesFound();

    const result = await fixtures.whenExecute();

    expect(result.questions).toEqual([]);
    expect(result.students).toEqual([]);
    expect(result.files).toEqual([]);
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly user: AuthUser = {
    id: 'user-1',
    email: 'owner@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'establishment' },
  };

  public readonly establishment = {
    id: 'est-1',
    supabaseUserId: 'user-1',
    name: 'École Nationale',
    email: 'owner@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly courseWithSession = {
    id: this.courseId,
    title: 'Introduction à TypeScript',
    description: 'Un cours sur TypeScript',
    contentText: 'Contenu du cours',
    validatedQuestions: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    session: {
      id: 'session-1',
      teacherId: 'teacher-1',
      name: 'Session TS',
      code: 'ABCD',
      language: 'francais' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    teachers: {
      id: 'teacher-1',
      name: 'Prof Martin',
      email: 'martin@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      establishmentId: 'est-1',
    },
  };

  public readonly questions = [
    {
      id: 'q-1',
      courseId: this.courseId,
      text: "Qu'est-ce que TypeScript ?",
      type: 'single' as const,
      answers: [],
      status: 'validated' as const,
    },
  ];

  public readonly studentStats = [
    {
      studentId: 'stu-1',
      attemptedQuestions: 5,
      correctAnswers: 4,
      lastAttemptAt: '2026-01-15T10:00:00.000Z',
      student: {
        id: 'stu-1',
        name: 'Alice',
        email: 'alice@school.com',
        photoUrl: null,
      },
    },
  ];

  public readonly files = [
    {
      id: 'file-1',
      courseId: this.courseId,
      fileUrl: 'course-1/doc.pdf',
      fileName: 'doc.pdf',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  public readonly establishmentRepository: jest.Mocked<EstablishmentRepository>;
  public readonly coursesRepository: jest.Mocked<CourseRepository>;
  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly studentsRepository: jest.Mocked<StudentRepository>;
  public readonly filesRepository: jest.Mocked<FileRepository>;
  public readonly useCase: GetSessionDetailsUseCase;

  constructor() {
    this.establishmentRepository = createMockEstablishmentRepository();
    this.coursesRepository = createMockCourseRepository();
    this.questionsRepository = createMockQuestionsRepository();
    this.studentsRepository = createMockStudentRepository();
    this.filesRepository = createMockFileRepository();
    this.useCase = new GetSessionDetailsUseCase(
      this.establishmentRepository,
      this.coursesRepository,
      this.questionsRepository,
      this.studentsRepository,
      this.filesRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId, this.user);
  }

  whenEstablishmentNotFound() {
    this.establishmentRepository.getEstablishmentByUserId.mockResolvedValue(
      null as any,
    );
  }

  whenEstablishmentFound() {
    this.establishmentRepository.getEstablishmentByUserId.mockResolvedValue(
      this.establishment,
    );
  }

  whenCourseNotFound() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(
      null as any,
    );
  }

  whenCourseFound() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue(
      this.courseWithSession as any,
    );
  }

  whenCourseFoundWithDifferentEstablishment() {
    this.coursesRepository.getCourseWithSessionById.mockResolvedValue({
      ...this.courseWithSession,
      teachers: {
        ...this.courseWithSession.teachers,
        establishmentId: 'other-est',
      },
    } as any);
  }

  whenQuestionsFound() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue(
      this.questions as any,
    );
  }

  whenNoQuestionsFound() {
    this.questionsRepository.getCourseQuestions.mockResolvedValue([]);
  }

  whenStudentsFound() {
    this.studentsRepository.getStudentStatsByCourseId.mockResolvedValue(
      this.studentStats as any,
    );
  }

  whenNoStudentsFound() {
    this.studentsRepository.getStudentStatsByCourseId.mockResolvedValue([]);
  }

  whenFilesFound() {
    this.filesRepository.getCourseFilesByCourseId.mockResolvedValue(this.files);
  }

  whenNoFilesFound() {
    this.filesRepository.getCourseFilesByCourseId.mockResolvedValue([]);
  }

  thenCourseDetailsReturned(result: any) {
    expect(result.course).toMatchObject({
      id: this.courseId,
      title: 'Introduction à TypeScript',
      description: 'Un cours sur TypeScript',
    });
    expect(result.questions).toHaveLength(1);
    expect(result.students).toHaveLength(1);
    expect(result.students[0]).toMatchObject({
      id: 'stu-1',
      name: 'Alice',
      email: 'alice@school.com',
      correctAnswers: 4,
      attemptedQuestions: 5,
    });
    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toMatchObject({
      id: 'file-1',
      fileName: 'doc.pdf',
    });
  }

  thenAllRepositoriesCalledWithCourseId() {
    expect(
      this.establishmentRepository.getEstablishmentByUserId,
    ).toHaveBeenCalledWith(this.user.id);
    expect(
      this.coursesRepository.getCourseWithSessionById,
    ).toHaveBeenCalledWith(this.courseId, expect.any(String));
    expect(this.questionsRepository.getCourseQuestions).toHaveBeenCalledWith(
      this.courseId,
    );
    expect(
      this.studentsRepository.getStudentStatsByCourseId,
    ).toHaveBeenCalledWith(this.courseId);
    expect(this.filesRepository.getCourseFilesByCourseId).toHaveBeenCalledWith(
      this.courseId,
    );
  }
}
