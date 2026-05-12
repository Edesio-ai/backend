import { ServerError } from 'src/domain/shared/errors/global.errors';
import { CourseQuestion } from 'src/domain/teaching/course-question/types/course-question.type';
import { CourseQuestionSupabaseRepository } from './course-question-supabase';

describe('CourseQuestionSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return pending question count for course ids', async () => {
    fixtures.whenGetPendingCountSucceeds(12);

    const result = await fixtures.whenGetPendingQuestionCount();

    expect(result).toBe(12);
    fixtures.thenGetPendingCountQueryBuilt();
  });

  it('should return 0 when pending count is null', async () => {
    fixtures.whenGetPendingCountReturnsNull();

    const result = await fixtures.whenGetPendingQuestionCount();

    expect(result).toBe(0);
  });

  it('should throw ServerError when getPendingQuestionCount fails', async () => {
    fixtures.whenGetPendingCountFails();

    await expect(fixtures.whenGetPendingQuestionCount()).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  it('should delete course_questions by course id', async () => {
    fixtures.whenDeleteCourseQuestionsByCourseIdSucceeds();

    await fixtures.whenDeleteCourseQuestionsByCourseId();

    fixtures.thenDeleteCourseQuestionsByCourseIdQueryBuilt();
  });

  it('should throw ServerError when deleteCourseQuestionsByCourseId fails', async () => {
    fixtures.whenDeleteCourseQuestionsByCourseIdFails();

    await expect(
      fixtures.whenDeleteCourseQuestionsByCourseId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  it('should return the answered question count for a student', async () => {
    fixtures.whenGetAnsweredCountSucceeds(17);

    const result = await fixtures.whenGetAnsweredQuestionCount();

    expect(result).toBe(17);
    fixtures.thenGetAnsweredCountQueryBuilt();
  });

  it('should return 0 when answered count is null', async () => {
    fixtures.whenGetAnsweredCountReturnsNull();

    const result = await fixtures.whenGetAnsweredQuestionCount();

    expect(result).toBe(0);
  });

  it('should throw ServerError when getAnsweredQuestionCount fails', async () => {
    fixtures.whenGetAnsweredCountFails();

    await expect(
      fixtures.whenGetAnsweredQuestionCount(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  it('should return mapped course_questions rows for a course', async () => {
    fixtures.whenGetCourseQuestionsByCourseIdSucceeds();

    const result = await fixtures.whenGetCourseQuestionsByCourseId();

    expect(result).toEqual(fixtures.expectedCourseQuestions);
    fixtures.thenGetCourseQuestionsByCourseIdQueryBuilt();
  });

  it('should return empty array when getCourseQuestionsByCourseId data is null', async () => {
    fixtures.whenGetCourseQuestionsByCourseIdReturnsNull();

    const result = await fixtures.whenGetCourseQuestionsByCourseId();

    expect(result).toEqual([]);
  });

  it('should throw ServerError when getCourseQuestionsByCourseId fails', async () => {
    fixtures.whenGetCourseQuestionsByCourseIdFails();

    await expect(
      fixtures.whenGetCourseQuestionsByCourseId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  it('should create course question and return mapped row', async () => {
    fixtures.whenCreateCourseQuestionSucceeds();

    const result = await fixtures.whenCreateCourseQuestion();

    expect(result).toEqual(fixtures.expectedCreatedCourseQuestion);
    fixtures.thenCreateCourseQuestionQueryBuilt();
  });

  it('should return null when createCourseQuestion returns no row', async () => {
    fixtures.whenCreateCourseQuestionReturnsNullData();

    const result = await fixtures.whenCreateCourseQuestion();

    expect(result).toBeNull();
    fixtures.thenCreateCourseQuestionQueryBuilt();
  });

  it('should throw ServerError when createCourseQuestion fails', async () => {
    fixtures.whenCreateCourseQuestionFails();

    await expect(fixtures.whenCreateCourseQuestion()).rejects.toBeInstanceOf(
      ServerError,
    );
    fixtures.thenCreateCourseQuestionQueryBuilt();
  });

  it('should return mapped course question when getCourseQuestionByCourseId succeeds', async () => {
    fixtures.whenGetCourseQuestionByCourseIdSucceeds();

    const result = await fixtures.whenGetCourseQuestionByCourseId();

    expect(result).toEqual(fixtures.expectedCourseQuestions[0]);
    fixtures.thenGetCourseQuestionByCourseIdQueryBuilt();
  });

  it('should return null when getCourseQuestionByCourseId returns no row', async () => {
    fixtures.whenGetCourseQuestionByCourseIdReturnsNullData();

    const result = await fixtures.whenGetCourseQuestionByCourseId();

    expect(result).toBeNull();
    fixtures.thenGetCourseQuestionByCourseIdQueryBuilt();
  });

  it('should throw ServerError when getCourseQuestionByCourseId fails', async () => {
    fixtures.whenGetCourseQuestionByCourseIdFails();

    await expect(
      fixtures.whenGetCourseQuestionByCourseId(),
    ).rejects.toBeInstanceOf(ServerError);
    fixtures.thenGetCourseQuestionByCourseIdQueryBuilt();
  });

  it('should update course question and return mapped row', async () => {
    fixtures.whenUpdateCourseQuestionSucceeds();

    const result = await fixtures.whenUpdateCourseQuestion();

    expect(result).toEqual(fixtures.expectedCourseQuestions[0]);
    fixtures.thenUpdateCourseQuestionQueryBuilt();
  });

  it('should return null when updateCourseQuestion returns no row', async () => {
    fixtures.whenUpdateCourseQuestionReturnsNullData();

    const result = await fixtures.whenUpdateCourseQuestion();

    expect(result).toBeNull();
    fixtures.thenUpdateCourseQuestionQueryBuilt();
  });

  it('should throw ServerError when updateCourseQuestion fails', async () => {
    fixtures.whenUpdateCourseQuestionFails();

    await expect(fixtures.whenUpdateCourseQuestion()).rejects.toBeInstanceOf(
      ServerError,
    );
    fixtures.thenUpdateCourseQuestionQueryBuilt();
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly courseIds = ['course-1', 'course-2'];
  public readonly studentId = 'student-1';

  public readonly courseQuestionSupabaseRow = {
    id: 'cq-1',
    course_id: this.courseId,
    student_id: this.studentId,
    question_text: 'Question élève ?',
    answer: 'Ma réponse',
    created_at: '2026-01-01T00:00:00.000Z',
    answered_at: '2026-01-02T00:00:00.000Z',
  };

  public readonly expectedCourseQuestions: CourseQuestion[] = [
    {
      id: 'cq-1',
      courseId: this.courseId,
      studentId: this.studentId,
      questionText: 'Question élève ?',
      answer: 'Ma réponse',
      createdAt: '2026-01-01T00:00:00.000Z',
      answeredAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  public readonly courseQuestionToInsert = {
    courseId: this.courseId,
    studentId: this.studentId,
    questionText: 'Nouvelle question',
  };

  public readonly insertedCourseQuestionSupabaseRow = {
    id: 'cq-new',
    course_id: this.courseId,
    student_id: this.studentId,
    question_text: this.courseQuestionToInsert.questionText,
    answer: '',
    created_at: '2026-01-03T00:00:00.000Z',
    answered_at: '',
  };

  public readonly expectedCreatedCourseQuestion: CourseQuestion = {
    id: 'cq-new',
    courseId: this.courseId,
    studentId: this.studentId,
    questionText: this.courseQuestionToInsert.questionText,
    answer: '',
    createdAt: '2026-01-03T00:00:00.000Z',
    answeredAt: '',
  };

  public readonly courseQuestionId = 'cq-1';

  public readonly answerPayload = {
    answer: 'Réponse mise à jour',
    answeredAt: '2026-05-10T16:00:00.000Z',
  };

  private readonly countSelectMock: jest.Mock = jest.fn();
  private readonly countInMock: jest.Mock = jest.fn();
  private readonly countIsMock: jest.Mock = jest.fn();

  private readonly countNotMock: jest.Mock = jest.fn();
  private readonly countEqMock: jest.Mock = jest.fn(() => ({
    not: this.countNotMock,
  }));

  private readonly courseQuestionsDeleteEqMock: jest.Mock = jest.fn();
  private readonly courseQuestionsDeleteMock: jest.Mock = jest.fn(() => ({
    eq: this.courseQuestionsDeleteEqMock,
  }));

  private readonly courseQuestionsListEqMock: jest.Mock = jest.fn();

  private readonly createSingleMock: jest.Mock = jest.fn();
  private readonly createSelectMock: jest.Mock = jest.fn(() => ({
    single: this.createSingleMock,
  }));
  private readonly createInsertMock: jest.Mock = jest.fn(() => ({
    select: this.createSelectMock,
  }));

  private createMode = false;
  private getByIdMode = false;
  private updateMode = false;

  private readonly getByIdSingleMock: jest.Mock = jest.fn();
  private readonly getByIdEqMock: jest.Mock = jest.fn(() => ({
    single: this.getByIdSingleMock,
  }));
  private readonly getByIdSelectMock: jest.Mock = jest.fn(() => ({
    eq: this.getByIdEqMock,
  }));

  private readonly updateSingleMock: jest.Mock = jest.fn();
  private readonly updateSelectMock: jest.Mock = jest.fn(() => ({
    single: this.updateSingleMock,
  }));
  private readonly updateEqMock: jest.Mock = jest.fn(() => ({
    select: this.updateSelectMock,
  }));
  private readonly updateMutationMock: jest.Mock = jest.fn(() => ({
    eq: this.updateEqMock,
  }));

  private readonly fromMock = jest.fn((_table: string) => {
    if (this.createMode) {
      return { insert: this.createInsertMock };
    }
    if (this.getByIdMode) {
      return {
        select: this.getByIdSelectMock,
      };
    }
    if (this.updateMode) {
      return {
        update: this.updateMutationMock,
      };
    }
    return {
      select: (...selectArgs: unknown[]) => {
        const options = selectArgs[1] as { head?: boolean } | undefined;
        if (options?.head === true) {
          return this.countSelectMock(...selectArgs);
        }
        return { eq: this.courseQuestionsListEqMock };
      },
      delete: this.courseQuestionsDeleteMock,
    };
  });

  public readonly repository: CourseQuestionSupabaseRepository;

  constructor() {
    this.countSelectMock.mockReturnValue({
      in: this.countInMock,
      eq: this.countEqMock,
    });
    this.countInMock.mockReturnValue({ is: this.countIsMock });

    const supabaseMock = { from: this.fromMock };
    this.repository = new CourseQuestionSupabaseRepository(supabaseMock as any);
  }

  whenGetPendingQuestionCount() {
    return this.repository.getPendingQuestionCount(this.courseIds);
  }

  whenDeleteCourseQuestionsByCourseId() {
    return this.repository.deleteCourseQuestionsByCourseId(this.courseId);
  }

  whenGetAnsweredQuestionCount() {
    return this.repository.getAnsweredQuestionCount(this.studentId);
  }

  whenGetCourseQuestionsByCourseId() {
    return this.repository.getCourseQuestionsByCourseId(this.courseId);
  }

  whenCreateCourseQuestion() {
    this.createMode = true;
    return this.repository.createCourseQuestion(this.courseQuestionToInsert);
  }

  whenGetCourseQuestionByCourseId() {
    this.getByIdMode = true;
    return this.repository.getCourseQuestionByCourseId(this.courseQuestionId);
  }

  whenUpdateCourseQuestion() {
    this.updateMode = true;
    return this.repository.updateCourseQuestion(
      this.courseQuestionId,
      this.answerPayload,
    );
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

  whenDeleteCourseQuestionsByCourseIdSucceeds() {
    this.courseQuestionsDeleteEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteCourseQuestionsByCourseIdFails() {
    this.courseQuestionsDeleteEqMock.mockResolvedValue({
      error: { message: 'delete course_questions failed' },
    });
  }

  whenGetAnsweredCountSucceeds(count: number) {
    this.countNotMock.mockResolvedValue({ count, error: null });
  }

  whenGetAnsweredCountReturnsNull() {
    this.countNotMock.mockResolvedValue({ count: null, error: null });
  }

  whenGetAnsweredCountFails() {
    this.countNotMock.mockResolvedValue({
      count: null,
      error: { message: 'answered count failed' },
    });
  }

  whenGetCourseQuestionsByCourseIdSucceeds() {
    this.courseQuestionsListEqMock.mockResolvedValue({
      data: [this.courseQuestionSupabaseRow],
      error: null,
    });
  }

  whenGetCourseQuestionsByCourseIdReturnsNull() {
    this.courseQuestionsListEqMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenGetCourseQuestionsByCourseIdFails() {
    this.courseQuestionsListEqMock.mockResolvedValue({
      data: null,
      error: { message: 'student course questions failed' },
    });
  }

  whenCreateCourseQuestionSucceeds() {
    this.createSingleMock.mockResolvedValue({
      data: this.insertedCourseQuestionSupabaseRow,
      error: null,
    });
  }

  whenCreateCourseQuestionReturnsNullData() {
    this.createSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenCreateCourseQuestionFails() {
    this.createSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'insert course_question failed' },
    });
  }

  whenGetCourseQuestionByCourseIdSucceeds() {
    this.getByIdSingleMock.mockResolvedValue({
      data: this.courseQuestionSupabaseRow,
      error: null,
    });
  }

  whenGetCourseQuestionByCourseIdReturnsNullData() {
    this.getByIdSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenGetCourseQuestionByCourseIdFails() {
    this.getByIdSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'get course_question failed' },
    });
  }

  whenUpdateCourseQuestionSucceeds() {
    this.updateSingleMock.mockResolvedValue({
      data: this.courseQuestionSupabaseRow,
      error: null,
    });
  }

  whenUpdateCourseQuestionReturnsNullData() {
    this.updateSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenUpdateCourseQuestionFails() {
    this.updateSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'update course_question failed' },
    });
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

  thenDeleteCourseQuestionsByCourseIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_questions');
    expect(this.courseQuestionsDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.courseQuestionsDeleteEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseId,
    );
  }

  thenGetAnsweredCountQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_questions');
    expect(this.countSelectMock).toHaveBeenCalledWith('*', {
      count: 'exact',
      head: true,
    });
    expect(this.countEqMock).toHaveBeenCalledWith('student_id', this.studentId);
    expect(this.countNotMock).toHaveBeenCalledWith('answer', 'is', null);
  }

  thenGetCourseQuestionsByCourseIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_questions');
    expect(this.courseQuestionsListEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseId,
    );
  }

  thenCreateCourseQuestionQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_questions');
    expect(this.createInsertMock).toHaveBeenCalledWith({
      course_id: this.courseQuestionToInsert.courseId,
      student_id: this.courseQuestionToInsert.studentId,
      question_text: this.courseQuestionToInsert.questionText,
    });
    expect(this.createSelectMock).toHaveBeenCalledTimes(1);
    expect(this.createSingleMock).toHaveBeenCalledTimes(1);
  }

  thenGetCourseQuestionByCourseIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_questions');
    expect(this.getByIdSelectMock).toHaveBeenCalledWith('*');
    expect(this.getByIdEqMock).toHaveBeenCalledWith(
      'id',
      this.courseQuestionId,
    );
    expect(this.getByIdSingleMock).toHaveBeenCalledTimes(1);
  }

  thenUpdateCourseQuestionQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_questions');
    expect(this.updateMutationMock).toHaveBeenCalledWith({
      answer: this.answerPayload.answer,
      answered_at: this.answerPayload.answeredAt,
    });
    expect(this.updateEqMock).toHaveBeenCalledWith('id', this.courseQuestionId);
    expect(this.updateSelectMock).toHaveBeenCalledWith();
    expect(this.updateSingleMock).toHaveBeenCalledTimes(1);
  }
}
