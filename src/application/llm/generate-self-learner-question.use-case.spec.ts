import { AuthUser } from 'src/domain/auth/types/auth.type';
import { BadRequestError, NotFoundError, ServerError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';
import type { GeneratedQuestion } from 'src/domain/llm/types/openai.type';
import type { ILlmProvider } from 'src/domain/llm/contracts/I-llm.provider';
import type { IPdfExtractorProvider } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import type { ICourseFileRepository } from 'src/domain/teaching/course-file/contracts/i-course-file.repository';
import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerQuestionRepository } from 'src/domain/teaching/self-learner-question/contracts/i-self-learner-question.repository';
import type { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockCourseFileRepository } from 'src/testing/mock-course-file-repository';
import { createMockSelfLearnerCourseFileRepository } from 'src/testing/mock-self-learner-course-file-repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerQuestionRepository } from 'src/testing/mock-self-learner-question-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';
import { GenerateSelfLearnerQuestionUseCase } from './generate-self-learner-question.use-case';

describe('GenerateSelfLearnerQuestionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('generates and persists a single question using course text content', async () => {
    fixtures.whenOwnershipOk();
    fixtures.whenNoFiles();
    fixtures.whenNoExistingQuestions();
    fixtures.whenOpenAiGenerates([fixtures.generatedSingle]);
    fixtures.questionRepo.createSelfLearnerQuestion.mockResolvedValue(fixtures.createdQuestion);

    const result = await fixtures.whenExecute('single');

    expect(fixtures.mistralRepo.generateQuestions).toHaveBeenCalledWith(
      fixtures.course.textContent,
      expect.objectContaining({
        totalQuestions: 1,
        singleCount: 1,
        openedCount: 0,
        language: fixtures.course.language,
      }),
      [],
    );
    expect(fixtures.questionRepo.createSelfLearnerQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: fixtures.courseId,
        type: 'single',
      }),
    );
    expect(result).toEqual(fixtures.createdQuestion);
  });

  it('passes openedCount=1 and singleCount=0 when type is open', async () => {
    fixtures.whenOwnershipOk();
    fixtures.whenNoFiles();
    fixtures.whenNoExistingQuestions();
    fixtures.whenOpenAiGenerates([fixtures.generatedOpen]);
    fixtures.questionRepo.createSelfLearnerQuestion.mockResolvedValue(fixtures.createdQuestion);

    await fixtures.whenExecute('open');

    expect(fixtures.mistralRepo.generateQuestions).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ singleCount: 0, openedCount: 1 }),
      expect.any(Array),
    );
  });

  it('passes existing question texts to OpenAI to avoid duplicates', async () => {
    fixtures.whenOwnershipOk();
    fixtures.whenNoFiles();
    fixtures.selfLearnerQuestionRepo.getSelfLearnerQuestions.mockResolvedValue([
      { ...fixtures.createdQuestion, questionText: 'Question déjà posée' },
    ]);
    fixtures.whenOpenAiGenerates([fixtures.generatedSingle]);
    fixtures.questionRepo.createSelfLearnerQuestion.mockResolvedValue(fixtures.createdQuestion);

    await fixtures.whenExecute('single');

    expect(fixtures.mistralRepo.generateQuestions).toHaveBeenCalledWith(expect.any(String), expect.any(Object), [
      'Question déjà posée',
    ]);
  });

  it('appends PDF content to course text when files are present', async () => {
    fixtures.whenOwnershipOk();
    fixtures.whenNoExistingQuestions();
    fixtures.selfLearnerCourseFileRepo.getSelfLearnerCourseFiles.mockResolvedValue([fixtures.courseFile]);
    fixtures.courseFileRepo.getFileBufferFromStorage.mockResolvedValue(Buffer.from('pdf-data'));
    fixtures.pdfExtractor.extractTextFromPdf.mockResolvedValue('Texte PDF');
    fixtures.whenOpenAiGenerates([fixtures.generatedSingle]);
    fixtures.questionRepo.createSelfLearnerQuestion.mockResolvedValue(fixtures.createdQuestion);

    await fixtures.whenExecute('single');

    expect(fixtures.mistralRepo.generateQuestions).toHaveBeenCalledWith(
      expect.stringContaining('Texte PDF'),
      expect.any(Object),
      expect.any(Array),
    );
  });

  it('continues without PDF text when PDF extraction fails', async () => {
    fixtures.whenOwnershipOk();
    fixtures.whenNoExistingQuestions();
    fixtures.selfLearnerCourseFileRepo.getSelfLearnerCourseFiles.mockResolvedValue([fixtures.courseFile]);
    fixtures.courseFileRepo.getFileBufferFromStorage.mockRejectedValue(new Error('storage down'));
    fixtures.whenOpenAiGenerates([fixtures.generatedSingle]);
    fixtures.questionRepo.createSelfLearnerQuestion.mockResolvedValue(fixtures.createdQuestion);

    await expect(fixtures.whenExecute('single')).resolves.toEqual(fixtures.createdQuestion);
  });

  it('throws BadRequestError when course has no text content and no files', async () => {
    fixtures.whenOwnershipOk({ textContent: '' });
    fixtures.whenNoFiles();
    fixtures.whenNoExistingQuestions();

    await expect(fixtures.whenExecute('single')).rejects.toBeInstanceOf(BadRequestError);
    expect(fixtures.questionRepo.createSelfLearnerQuestion).not.toHaveBeenCalled();
  });

  it('throws ServerError when OpenAI returns empty array', async () => {
    fixtures.whenOwnershipOk();
    fixtures.whenNoFiles();
    fixtures.whenNoExistingQuestions();
    fixtures.whenOpenAiGenerates([]);

    await expect(fixtures.whenExecute('single')).rejects.toBeInstanceOf(ServerError);
    expect(fixtures.questionRepo.createSelfLearnerQuestion).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when self learner is missing', async () => {
    fixtures.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(null);

    await expect(fixtures.whenExecute('single')).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.mistralRepo.generateQuestions).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course is missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue(null);

    await expect(fixtures.whenExecute('single')).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.mistralRepo.generateQuestions).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedError when course belongs to another learner', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      ...fixtures.course,
      selfLearnerId: 'other-sl',
    });

    await expect(fixtures.whenExecute('single')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fixtures.mistralRepo.generateQuestions).not.toHaveBeenCalled();
  });
});

class Fixtures {
  public readonly userId = 'auth-gen-sl-q';
  public readonly courseId = 'sl-course-gen';

  public readonly user: AuthUser = {
    id: this.userId,
    email: 'u@test.com',
    metadata: { role: 'self-learner' },
  };

  public readonly learner = {
    id: 'sl-gen-1',
    supabaseUserId: this.userId,
    name: 'A',
    email: 'a@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly course = {
    id: this.courseId,
    selfLearnerId: this.learner.id,
    title: 'Cours gen',
    description: null as string | null,
    textContent: 'Contenu du cours à mémoriser.',
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly courseFile = {
    id: 'cf-1',
    courseId: this.courseId,
    fileUrl: 'self-learner/sl-course-gen/notes.pdf',
    fileName: 'notes.pdf',
    createdAt: '2026-01-03T00:00:00.000Z',
  };

  public readonly generatedSingle = {
    type: 'single' as const,
    questionText: 'Question générée ?',
    keyConcepts: ['k'],
    proposals: ['A', 'B'],
    correctAnswers: ['A'],
    explanation: 'Explication',
  };

  public readonly generatedOpen = {
    type: 'open' as const,
    questionText: 'Réponse libre ?',
    keyConcepts: [],
    proposals: [],
    correctAnswers: ['Réponse'],
    explanation: '',
  };

  public readonly createdQuestion: SelfLearnerQuestion = {
    id: 'sq-gen-1',
    courseId: this.courseId,
    type: 'single',
    questionText: 'Question générée ?',
    proposals: ['A', 'B'],
    correctAnswers: ['A'],
    explanation: 'Explication',
    createdAt: new Date('2026-01-04T10:00:00.000Z'),
  };

  public readonly selfLearnerRepo: jest.Mocked<ISelfLearnerRepository>;
  public readonly courseRepo: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly selfLearnerCourseFileRepo: jest.Mocked<ISelfLearnerCourseFileRepository>;
  public readonly courseFileRepo: jest.Mocked<ICourseFileRepository>;
  public readonly pdfExtractor: jest.Mocked<IPdfExtractorProvider>;
  public readonly selfLearnerQuestionRepo: jest.Mocked<ISelfLearnerQuestionRepository>;
  public readonly questionRepo: jest.Mocked<ISelfLearnerQuestionRepository>;
  public readonly mistralRepo: jest.Mocked<ILlmProvider>;
  public readonly useCase: GenerateSelfLearnerQuestionUseCase;

  constructor() {
    this.selfLearnerRepo = createMockSelfLearnerRepository();
    this.courseRepo = createMockSelfLearnerCourseRepository();
    this.selfLearnerCourseFileRepo = createMockSelfLearnerCourseFileRepository();
    this.courseFileRepo = createMockCourseFileRepository();
    this.pdfExtractor = {
      extractTextFromPdf: jest.fn(),
      extractQuestionsToPdf: jest.fn(),
    };
    this.selfLearnerQuestionRepo = createMockSelfLearnerQuestionRepository();
    this.questionRepo = this.selfLearnerQuestionRepo;
    this.mistralRepo = {
      generateQuestions: jest.fn(),
      evaluateAnswer: jest.fn(),
      generateCompletionFeedback: jest.fn(),
    };

    this.useCase = new GenerateSelfLearnerQuestionUseCase(
      this.selfLearnerRepo,
      this.courseRepo,
      this.selfLearnerCourseFileRepo,
      this.courseFileRepo,
      this.pdfExtractor,
      this.selfLearnerQuestionRepo,
      this.mistralRepo,
    );
  }

  whenExecute(type: 'single' | 'open' | 'multiple') {
    return this.useCase.execute(this.user, type, this.courseId);
  }

  whenLearnerExists() {
    this.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenOwnershipOk(courseOverrides: Partial<typeof this.course> = {}) {
    this.whenLearnerExists();
    this.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      ...this.course,
      ...courseOverrides,
    });
  }

  whenNoFiles() {
    this.selfLearnerCourseFileRepo.getSelfLearnerCourseFiles.mockResolvedValue([]);
  }

  whenNoExistingQuestions() {
    this.selfLearnerQuestionRepo.getSelfLearnerQuestions.mockResolvedValue([]);
  }

  whenOpenAiGenerates(questions: GeneratedQuestion[]) {
    this.mistralRepo.generateQuestions.mockResolvedValue(questions);
  }
}
