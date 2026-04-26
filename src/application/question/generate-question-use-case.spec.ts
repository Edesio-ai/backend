import {
  GenerateQuestionBody,
  GenerateQuestionUseCase,
} from './generate-question-use-case';
import { AuthUser } from '../../domain/auth/types/auth.type';
import { ForbiddenError } from '../../domain/shared/global/errors/global.errors';
import {
  QuestionBadRequestError,
  TeacherNotFoundError,
} from '../../domain/teaching/error';
import { OpenaiRepository } from '../../domain/shared/llm/openai/contracts/opena-ai.repository';
import { PdfExtractor } from '../../domain/pdf/contracts/pdf-extractor.interface';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import {
  CourseFile,
  CourseWithSession,
} from '../../domain/teaching/types/course.type';
import {
  GeneratedQuestion,
  Question,
} from '../../domain/teaching/types/question.type';

describe('GenerateQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw TeacherNotFoundError when teacher is missing', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      TeacherNotFoundError,
    );
    expect(
      fixtures.courseRepository.getCourseWithSessionById,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when session belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.openaiRepository.generateQuestions).not.toHaveBeenCalled();
  });

  it('should throw QuestionBadRequestError when no content and no files', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher({ contentText: '' });
    fixtures.whenNoFiles();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      QuestionBadRequestError,
    );
  });

  it('should throw QuestionBadRequestError when OpenAI returns no questions', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenNoFiles();
    fixtures.whenOpenAiReturnsNoQuestions();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(
      QuestionBadRequestError,
    );
  });

  it('should generate, delete old questions and insert new ones', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenNoFiles();
    fixtures.whenOpenAiReturnsQuestions();
    fixtures.whenInsertSucceeds();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.questionRepository.deleteCourseQuestions,
    ).toHaveBeenCalledWith(fixtures.body.courseId);
    expect(fixtures.questionRepository.insertQuestions).toHaveBeenCalledWith(
      expect.any(Array),
      fixtures.body.courseId,
    );
    expect(result).toEqual(fixtures.insertedQuestions);
  });

  it('should extract text from PDF files and append to content', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher({ contentText: 'Contenu' });
    fixtures.whenFilesAvailable();
    fixtures.whenPdfExtractorReturnsText('Texte du PDF');
    fixtures.whenOpenAiReturnsQuestions();
    fixtures.whenInsertSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.pdfExtractor.extractTextFromPdf).toHaveBeenCalledTimes(1);
    expect(fixtures.openaiRepository.generateQuestions).toHaveBeenCalledWith(
      expect.stringContaining('Texte du PDF'),
      expect.any(Object),
    );
  });

  it('should continue if PDF processing fails for a file', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher({ contentText: 'Contenu' });
    fixtures.whenFilesAvailable();
    fixtures.whenPdfExtractorThrows();
    fixtures.whenOpenAiReturnsQuestions();
    fixtures.whenInsertSucceeds();

    await expect(fixtures.whenExecute()).resolves.toBeDefined();
  });

  it('should alternate multiple and open questions', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCourseWithSessionMatchesTeacher();
    fixtures.whenNoFiles();
    fixtures.whenOpenAiReturnsMixedQuestions();
    fixtures.whenInsertSucceeds();

    await fixtures.whenExecute();

    const insertCall = (
      fixtures.questionRepository.insertQuestions as jest.Mock
    ).mock.calls[0][0] as GeneratedQuestion[];
    expect(insertCall[0].type).toBe('multiple');
    expect(insertCall[1].type).toBe('open');
    expect(insertCall[2].type).toBe('multiple');
    expect(insertCall[3].type).toBe('open');
  });
});

class Fixtures {
  public readonly body: GenerateQuestionBody = {
    courseId: 'course-1',
    totalQuestions: 4,
    multipleChoiceCount: 2,
    openedCount: 2,
  };

  public readonly user: AuthUser = {
    id: 'user-1',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Prof',
    email: 't@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null as string | null,
    availableChatbots: 0,
    supabaseUserId: this.user.id,
  };

  public readonly insertedQuestions: Question[] = [
    {
      id: 'q-1',
      courseId: this.body.courseId,
      type: 'multiple',
      questionText: 'Q1 ?',
      proposals: ['A', 'B'],
      correctAnswers: ['A'],
      explanation: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      positionOrder: 1,
    },
  ];

  private readonly generatedMultiple: GeneratedQuestion = {
    type: 'multiple',
    questionText: 'QCM ?',
    keyConcepts: [],
    proposals: ['A', 'B', 'C', 'D'],
    correctAnswers: ['A'],
    explanation: 'Explication',
  };

  private readonly generatedOpen: GeneratedQuestion = {
    type: 'open',
    questionText: 'Ouverte ?',
    keyConcepts: [],
    proposals: [],
    correctAnswers: ['Réponse'],
    explanation: 'Explication',
  };

  private readonly courseFile: CourseFile = {
    id: 'file-1',
    courseId: this.body.courseId,
    fileUrl: 'course-1/doc.pdf',
    fileName: 'doc.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly pdfExtractor: jest.Mocked<PdfExtractor>;
  public readonly openaiRepository: jest.Mocked<OpenaiRepository>;
  public readonly questionRepository: jest.Mocked<QuestionsRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly useCase: GenerateQuestionUseCase;

  constructor() {
    this.courseRepository = {
      getCourseById: jest.fn(),
      getCourseWithSessionById: jest.fn(),
      getSessionCoursesBySessionId: jest.fn(),
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
      getSessionCoursesCount: jest.fn(),
      createCourse: jest.fn(),
      storeCourseFile: jest.fn(),
      insertCourseFile: jest.fn(),
      getCourseValidatedQuestions: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
      getFileBufferFromStorage: jest.fn(),
    };
    this.pdfExtractor = { extractTextFromPdf: jest.fn() };
    this.openaiRepository = { generateQuestions: jest.fn() };
    this.questionRepository = {
      getQuestionById: jest.fn(),
      deleteQuestionById: jest.fn(),
      insertQuestions: jest.fn(),
      insertQuestion: jest.fn(),
      deleteQuestionsByCourseIds: jest.fn(),
      getPendingQuestionCount: jest.fn(),
      getCourseQuestions: jest.fn(),
      deleteCourseQuestions: jest.fn(),
      updateQuestionById: jest.fn(),
    };
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
    };

    this.useCase = new GenerateQuestionUseCase(
      this.courseRepository,
      this.pdfExtractor,
      this.openaiRepository,
      this.questionRepository,
      this.teacherRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.body, this.user);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenCourseWithSessionMatchesTeacher(
    overrides: Partial<CourseWithSession> = {},
  ) {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      contentText: 'Contenu du cours',
      session: { teacherId: this.teacher.id, language: 'francais' },
      ...overrides,
    });
  }

  whenCourseSessionBelongsToOtherTeacher() {
    this.courseRepository.getCourseWithSessionById.mockResolvedValue({
      id: this.body.courseId,
      contentText: 'Contenu',
      session: { teacherId: 'other-teacher', language: 'francais' },
    });
  }

  whenNoFiles() {
    this.courseRepository.getCourseFilesByCourseId.mockResolvedValue([]);
  }

  whenFilesAvailable() {
    this.courseRepository.getCourseFilesByCourseId.mockResolvedValue([
      this.courseFile,
    ]);
    this.courseRepository.getFileBufferFromStorage.mockResolvedValue(
      Buffer.from('pdf-data'),
    );
  }

  whenPdfExtractorReturnsText(text: string) {
    this.pdfExtractor.extractTextFromPdf.mockResolvedValue(text);
  }

  whenPdfExtractorThrows() {
    this.pdfExtractor.extractTextFromPdf.mockRejectedValue(
      new Error('PDF parse error'),
    );
  }

  whenOpenAiReturnsQuestions() {
    this.openaiRepository.generateQuestions.mockResolvedValue([
      this.generatedMultiple,
      this.generatedOpen,
    ]);
  }

  whenOpenAiReturnsMixedQuestions() {
    this.openaiRepository.generateQuestions.mockResolvedValue([
      { ...this.generatedMultiple },
      { ...this.generatedMultiple },
      { ...this.generatedOpen },
      { ...this.generatedOpen },
    ]);
  }

  whenOpenAiReturnsNoQuestions() {
    this.openaiRepository.generateQuestions.mockResolvedValue([]);
  }

  whenInsertSucceeds() {
    this.questionRepository.deleteCourseQuestions.mockResolvedValue(undefined);
    this.questionRepository.insertQuestions.mockResolvedValue(
      this.insertedQuestions,
    );
  }
}
