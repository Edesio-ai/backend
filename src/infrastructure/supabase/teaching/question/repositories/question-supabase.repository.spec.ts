import { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { GeneratedQuestion } from 'src/domain/llm/types/openai.type';
import { CreateQuestionBody, Question } from 'src/domain/teaching/question/types/question.type';
import { QuestionSupabaseRepository } from './question-supabase.repository';

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

  it('should throw ServerError when deleteQuestionsByCourseIds fails', async () => {
    fixtures.whenDeleteByCourseIdsFails();

    await expect(fixtures.whenDeleteQuestionsByCourseIds()).rejects.toBeInstanceOf(ServerError);
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

  it('should throw ServerError when getCourseQuestions fails', async () => {
    fixtures.whenGetCourseQuestionsFails();

    await expect(fixtures.whenGetCourseQuestions()).rejects.toBeInstanceOf(ServerError);
  });

  // --- insertQuestions ---

  it('should insert questions and return mapped results', async () => {
    fixtures.whenInsertQuestionsSucceeds();

    const result = await fixtures.whenInsertQuestions();

    expect(result).toEqual(fixtures.expectedQuestions);
    fixtures.thenInsertQuestionsQueryBuilt();
  });

  it('should throw ServerError when insertQuestions fails', async () => {
    fixtures.whenInsertQuestionsFails();

    await expect(fixtures.whenInsertQuestions()).rejects.toBeInstanceOf(ServerError);
  });

  // --- insertQuestion (single) ---

  it('should insert a single question and return the mapped result', async () => {
    fixtures.whenInsertQuestionSucceeds();

    const result = await fixtures.whenInsertQuestion();

    expect(result).toEqual(fixtures.expectedQuestions[0]);
    fixtures.thenInsertQuestionQueryBuilt();
  });

  it('should throw ServerError when insertQuestion fails', async () => {
    fixtures.whenInsertQuestionFails();

    await expect(fixtures.whenInsertQuestion()).rejects.toBeInstanceOf(ServerError);
  });

  // --- deleteCourseQuizQuestions ---

  it('should delete questions for a course', async () => {
    fixtures.whenDeleteCourseQuestionsSucceeds();

    await fixtures.whenDeleteCourseQuestions();

    fixtures.thenDeleteCourseQuestionsQueryBuilt();
  });

  it('should throw ServerError when deleteCourseQuizQuestions fails', async () => {
    fixtures.whenDeleteCourseQuestionsFails();

    await expect(fixtures.whenDeleteCourseQuestions()).rejects.toBeInstanceOf(ServerError);
  });

  // --- getQuestionById ---

  it('should return a mapped question by id', async () => {
    fixtures.whenGetQuestionByIdSucceeds();

    const result = await fixtures.whenGetQuestionById();

    expect(result).toEqual(fixtures.expectedQuestions[0]);
    fixtures.thenGetQuestionByIdQueryBuilt();
  });

  it('should throw ServerError when getQuestionById fails', async () => {
    fixtures.whenGetQuestionByIdFails();

    await expect(fixtures.whenGetQuestionById()).rejects.toBeInstanceOf(ServerError);
  });

  // --- deleteQuestionById ---

  it('should delete a question by id', async () => {
    fixtures.whenDeleteQuestionByIdSucceeds();

    await fixtures.whenDeleteQuestionById();

    fixtures.thenDeleteQuestionByIdQueryBuilt();
  });

  it('should throw ServerError when deleteQuestionById fails', async () => {
    fixtures.whenDeleteQuestionByIdFails();

    await expect(fixtures.whenDeleteQuestionById()).rejects.toBeInstanceOf(ServerError);
  });

  // --- updateQuestionById ---

  it('should update a question by id and return the mapped result', async () => {
    fixtures.whenUpdateQuestionByIdSucceeds();

    const result = await fixtures.whenUpdateQuestionById();

    expect(result).toEqual(fixtures.expectedQuestions[0]);
    fixtures.thenUpdateQuestionByIdQueryBuilt();
  });

  it('should throw ServerError when updateQuestionById fails', async () => {
    fixtures.whenUpdateQuestionByIdFails();

    await expect(fixtures.whenUpdateQuestionById()).rejects.toBeInstanceOf(ServerError);
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
    cheating_detection_enabled: true,
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
      cheatingDetectionEnabled: true,
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

  public readonly createQuestionBody: CreateQuestionBody = {
    courseId: this.courseId,
    type: 'multiple',
    questionText: 'Quelle est la réponse ?',
    proposals: ['A', 'B', 'C', 'D'],
    correctAnswers: ['a'],
    explanation: 'Parce que A',
  };

  private readonly inMock: jest.Mock = jest.fn();
  private readonly deleteMock: jest.Mock = jest.fn(() => ({ in: this.inMock }));

  private readonly questionsOrderMock: jest.Mock = jest.fn();
  private readonly getByIdSingleMock: jest.Mock = jest.fn();
  private readonly questionsEqMock: jest.Mock = jest.fn(() => ({
    order: this.questionsOrderMock,
    single: this.getByIdSingleMock,
  }));

  private readonly insertSingleMock: jest.Mock = jest.fn();
  private readonly insertSelectMock: jest.Mock = jest.fn(() => ({
    single: this.insertSingleMock,
  }));
  private readonly insertMock: jest.Mock = jest.fn(() => ({
    select: this.insertSelectMock,
  }));

  private readonly deleteEqMock: jest.Mock = jest.fn();

  private readonly updateSingleMock: jest.Mock = jest.fn();
  private readonly updateSelectMock: jest.Mock = jest.fn(() => ({
    single: this.updateSingleMock,
  }));
  private readonly updateEqMock: jest.Mock = jest.fn(() => ({
    select: this.updateSelectMock,
  }));
  private readonly updateMock: jest.Mock = jest.fn(() => ({
    eq: this.updateEqMock,
  }));

  private readonly questionsSelectMock: jest.Mock = jest.fn(() => ({
    eq: this.questionsEqMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'questions') {
      return {
        delete: this.deleteMock,
        select: this.questionsSelectMock,
        insert: this.insertMock,
        update: this.updateMock,
      };
    }
    return {};
  });

  public readonly repository: QuestionSupabaseRepository;

  constructor() {
    const supabaseMock = { from: this.fromMock };
    this.repository = new QuestionSupabaseRepository(supabaseMock as unknown as SupabaseClient);
  }

  whenDeleteQuestionsByCourseIds() {
    return this.repository.deleteQuestionsByCourseIds(this.courseIds);
  }

  whenGetCourseQuestions() {
    return this.repository.getCourseQuestions(this.courseId);
  }

  whenInsertQuestions() {
    return this.repository.insertQuestions([this.generatedQuestion], this.courseId);
  }

  whenDeleteCourseQuestions() {
    return this.repository.deleteCourseQuizQuestions(this.courseId);
  }

  whenInsertQuestion() {
    return this.repository.insertQuestion(this.createQuestionBody);
  }

  whenGetQuestionById() {
    return this.repository.getQuestionById('q-1');
  }

  whenDeleteQuestionById() {
    return this.repository.deleteQuestionById('q-1');
  }

  whenUpdateQuestionById() {
    return this.repository.updateQuestionById('q-1', {
      questionText: 'Mise à jour',
    });
  }

  whenDeleteByCourseIdsSucceeds() {
    this.inMock.mockResolvedValue({ error: null });
  }

  whenDeleteByCourseIdsFails() {
    this.inMock.mockResolvedValue({ error: { message: 'delete failed' } });
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

  whenInsertQuestionSucceeds() {
    this.insertSingleMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
  }

  whenInsertQuestionFails() {
    this.insertSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'insert single failed' },
    });
  }

  whenGetQuestionByIdSucceeds() {
    this.getByIdSingleMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
  }

  whenGetQuestionByIdFails() {
    this.getByIdSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'question not found' },
    });
  }

  whenDeleteQuestionByIdSucceeds() {
    this.deleteEqMock.mockResolvedValue({ error: null });
    this.deleteMock.mockReturnValue({
      in: this.inMock,
      eq: this.deleteEqMock,
    });
  }

  whenDeleteQuestionByIdFails() {
    this.deleteEqMock.mockResolvedValue({
      error: { message: 'delete by id failed' },
    });
    this.deleteMock.mockReturnValue({
      in: this.inMock,
      eq: this.deleteEqMock,
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

  whenUpdateQuestionByIdSucceeds() {
    this.updateSingleMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
  }

  whenUpdateQuestionByIdFails() {
    this.updateSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'update failed' },
    });
  }

  thenDeleteByCourseIdsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.deleteMock).toHaveBeenCalledTimes(1);
    expect(this.inMock).toHaveBeenCalledWith('course_id', this.courseIds);
  }

  thenGetCourseQuestionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.questionsSelectMock).toHaveBeenCalledWith('*');
    expect(this.questionsEqMock).toHaveBeenCalledWith('course_id', this.courseId);
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

  thenInsertQuestionQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        course_id: this.courseId,
        type: 'multiple',
        question_text: 'Quelle est la réponse ?',
      }),
    );
    expect(this.insertSelectMock).toHaveBeenCalledTimes(1);
    expect(this.insertSingleMock).toHaveBeenCalledTimes(1);
  }

  thenGetQuestionByIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.questionsSelectMock).toHaveBeenCalledWith('*');
    expect(this.questionsEqMock).toHaveBeenCalledWith('id', 'q-1');
    expect(this.getByIdSingleMock).toHaveBeenCalledTimes(1);
  }

  thenDeleteQuestionByIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.deleteEqMock).toHaveBeenCalledWith('id', 'q-1');
  }

  thenUpdateQuestionByIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.updateMock).toHaveBeenCalledWith(expect.objectContaining({ question_text: 'Mise à jour' }));
    expect(this.updateEqMock).toHaveBeenCalledWith('id', 'q-1');
    expect(this.updateSelectMock).toHaveBeenCalledTimes(1);
    expect(this.updateSingleMock).toHaveBeenCalledTimes(1);
  }
}
