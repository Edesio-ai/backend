import { QuestionServerError } from 'src/domain/teaching/error';
import { QuestionSupabaseRepository } from './question-supabase.repository';
import {
  GeneratedQuestion,
  Question,
} from 'src/domain/teaching/types/question.type';

describe('QuestionSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  // --- deleteQuestionsByCourseIds ---

  it('should delete questions for course ids', async () => {
    fixtures.whenDeleteByCourseIdsSucceeds();

    await fixtures.whenDeleteQuestionsByCourseIds();

    fixtures.thenDeleteByCourseIdsQueryBuilt();
  });

  it('should throw QuestionServerError when deleteQuestionsByCourseIds fails', async () => {
    fixtures.whenDeleteByCourseIdsFails();

    await expect(
      fixtures.whenDeleteQuestionsByCourseIds(),
    ).rejects.toBeInstanceOf(QuestionServerError);
  });

  // --- getPendingQuestionCount ---

  it('should return pending question count for course ids', async () => {
    fixtures.whenGetPendingCountSucceeds(12);

    const result = await fixtures.whenGetPendingQuestionCount();

    expect(result).toBe(12);
    fixtures.thenGetPendingCountQueryBuilt();
  });

  it('should return 0 when count is null', async () => {
    fixtures.whenGetPendingCountReturnsNull();

    const result = await fixtures.whenGetPendingQuestionCount();

    expect(result).toBe(0);
  });

  it('should throw QuestionServerError when getPendingQuestionCount fails', async () => {
    fixtures.whenGetPendingCountFails();

    await expect(fixtures.whenGetPendingQuestionCount()).rejects.toBeInstanceOf(
      QuestionServerError,
    );
  });

  // --- getCourseQuestions ---

  it('should return mapped questions for a course', async () => {
    fixtures.whenGetCourseQuestionsSucceeds();

    const result = await fixtures.whenGetCourseQuestions();

    expect(result).toEqual(fixtures.expectedQuestions);
    fixtures.thenGetCourseQuestionsQueryBuilt();
  });

  it('should return empty array when getCourseQuestions data is null', async () => {
    fixtures.whenGetCourseQuestionsReturnsNull();

    const result = await fixtures.whenGetCourseQuestions();

    expect(result).toEqual([]);
  });

  it('should throw QuestionServerError when getCourseQuestions fails', async () => {
    fixtures.whenGetCourseQuestionsFails();

    await expect(fixtures.whenGetCourseQuestions()).rejects.toBeInstanceOf(
      QuestionServerError,
    );
  });

  // --- insertQuestions ---

  it('should insert questions and return mapped results', async () => {
    fixtures.whenInsertQuestionsSucceeds();

    const result = await fixtures.whenInsertQuestions();

    expect(result).toEqual(fixtures.expectedQuestions);
    fixtures.thenInsertQuestionsQueryBuilt();
  });

  it('should throw QuestionServerError when insertQuestions fails', async () => {
    fixtures.whenInsertQuestionsFails();

    await expect(fixtures.whenInsertQuestions()).rejects.toBeInstanceOf(
      QuestionServerError,
    );
  });

  // --- deleteCourseQuestions ---

  it('should delete questions for a course', async () => {
    fixtures.whenDeleteCourseQuestionsSucceeds();

    await fixtures.whenDeleteCourseQuestions();

    fixtures.thenDeleteCourseQuestionsQueryBuilt();
  });

  it('should throw QuestionServerError when deleteCourseQuestions fails', async () => {
    fixtures.whenDeleteCourseQuestionsFails();

    await expect(fixtures.whenDeleteCourseQuestions()).rejects.toBeInstanceOf(
      QuestionServerError,
    );
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly courseIds = ['course-1', 'course-2'];

  public readonly supabaseRow = {
    id: 'q-1',
    course_id: this.courseId,
    type: 'multiple',
    question_text: 'Quelle est la réponse ?',
    proposals: [{ id: 'a', label: 'A' }],
    correct_answers: ['a'],
    explanation: 'Parce que A',
    created_at: '2026-01-01T00:00:00.000Z',
    position_order: 1,
  };

  public readonly expectedQuestions: Question[] = [
    {
      id: 'q-1',
      courseId: this.courseId,
      type: 'multiple',
      questionText: 'Quelle est la réponse ?',
      proposals: [{ id: 'a', label: 'A' }],
      correctAnswers: ['a'],
      explanation: 'Parce que A',
      createdAt: '2026-01-01T00:00:00.000Z',
      positionOrder: 1,
    },
  ];

  public readonly generatedQuestion: GeneratedQuestion = {
    type: 'multiple',
    questionText: 'Quelle est la réponse ?',
    keyConcepts: [],
    proposals: ['A', 'B', 'C', 'D'],
    correctAnswers: ['A'],
    explanation: 'Parce que A',
  };

  // --- mocks ---

  private readonly inMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({ in: this.inMock }));

  private readonly countSelectMock = jest.fn();
  private readonly countInMock = jest.fn();
  private readonly countIsMock = jest.fn();

  private readonly questionsOrderMock = jest.fn();
  private readonly questionsEqMock = jest.fn(() => ({
    order: this.questionsOrderMock,
  }));

  private readonly insertSelectMock = jest.fn();
  private readonly insertMock = jest.fn(() => ({
    select: this.insertSelectMock,
  }));

  private readonly deleteEqMock = jest.fn();
  private readonly deleteCourseQMock = jest.fn(() => ({
    eq: this.deleteEqMock,
  }));

  private readonly questionsSelectMock = jest.fn(() => ({
    eq: this.questionsEqMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'questions') {
      return {
        delete: this.deleteMock,
        select: this.questionsSelectMock,
        insert: this.insertMock,
      };
    }
    if (table === 'course_questions') {
      return { select: this.countSelectMock };
    }
    return {};
  });

  public readonly repository: QuestionSupabaseRepository;

  constructor() {
    this.countSelectMock.mockReturnValue({ in: this.countInMock });
    this.countInMock.mockReturnValue({ is: this.countIsMock });

    const supabaseMock = { from: this.fromMock };
    this.repository = new QuestionSupabaseRepository(supabaseMock as any);
  }

  // --- actions ---

  whenDeleteQuestionsByCourseIds() {
    return this.repository.deleteQuestionsByCourseIds(this.courseIds);
  }

  whenGetPendingQuestionCount() {
    return this.repository.getPendingQuestionCount(this.courseIds);
  }

  whenGetCourseQuestions() {
    return this.repository.getCourseQuestions(this.courseId);
  }

  whenInsertQuestions() {
    return this.repository.insertQuestions(
      [this.generatedQuestion],
      this.courseId,
    );
  }

  whenDeleteCourseQuestions() {
    return this.repository.deleteCourseQuestions(this.courseId);
  }

  // --- setup ---

  whenDeleteByCourseIdsSucceeds() {
    this.inMock.mockResolvedValue({ error: null });
  }

  whenDeleteByCourseIdsFails() {
    this.inMock.mockResolvedValue({ error: { message: 'delete failed' } });
  }

  whenGetPendingCountSucceeds(count: number) {
    this.countIsMock.mockResolvedValue({ count, error: null });
  }

  whenGetPendingCountReturnsNull() {
    this.countIsMock.mockResolvedValue({ count: null, error: null });
  }

  whenGetPendingCountFails() {
    this.countIsMock.mockResolvedValue({
      count: null,
      error: { message: 'count failed' },
    });
  }

  whenGetCourseQuestionsSucceeds() {
    this.questionsOrderMock.mockResolvedValue({
      data: [this.supabaseRow],
      error: null,
    });
  }

  whenGetCourseQuestionsReturnsNull() {
    this.questionsOrderMock.mockResolvedValue({ data: null, error: null });
  }

  whenGetCourseQuestionsFails() {
    this.questionsOrderMock.mockResolvedValue({
      data: null,
      error: { message: 'select failed' },
    });
  }

  whenInsertQuestionsSucceeds() {
    this.insertSelectMock.mockResolvedValue({
      data: [this.supabaseRow],
      error: null,
    });
  }

  whenInsertQuestionsFails() {
    this.insertSelectMock.mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });
  }

  whenDeleteCourseQuestionsSucceeds() {
    this.deleteEqMock.mockResolvedValue({ error: null });
    this.deleteMock.mockReturnValue({
      in: this.inMock,
      eq: this.deleteEqMock,
    });
  }

  whenDeleteCourseQuestionsFails() {
    this.deleteEqMock.mockResolvedValue({
      error: { message: 'delete failed' },
    });
    this.deleteMock.mockReturnValue({
      in: this.inMock,
      eq: this.deleteEqMock,
    });
  }

  // --- assertions ---

  thenDeleteByCourseIdsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.deleteMock).toHaveBeenCalledTimes(1);
    expect(this.inMock).toHaveBeenCalledWith('course_id', this.courseIds);
  }

  thenGetPendingCountQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_questions');
    expect(this.countSelectMock).toHaveBeenCalledWith('*', {
      count: 'exact',
      head: true,
    });
    expect(this.countInMock).toHaveBeenCalledWith('course_id', this.courseIds);
    expect(this.countIsMock).toHaveBeenCalledWith('answer', null);
  }

  thenGetCourseQuestionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.questionsSelectMock).toHaveBeenCalledWith('*');
    expect(this.questionsEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseId,
    );
    expect(this.questionsOrderMock).toHaveBeenCalledWith('created_at', {
      ascending: true,
    });
  }

  thenInsertQuestionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.insertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          course_id: this.courseId,
          type: 'multiple',
          question_text: 'Quelle est la réponse ?',
        }),
      ]),
    );
    expect(this.insertSelectMock).toHaveBeenCalledTimes(1);
  }

  thenDeleteCourseQuestionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.deleteEqMock).toHaveBeenCalledWith('course_id', this.courseId);
  }
}
