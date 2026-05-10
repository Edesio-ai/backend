import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { CourseQuestion } from 'src/domain/teaching/types/course-question.type';
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

  private readonly fromMock = jest.fn((_table: string) => ({
    select: (...selectArgs: unknown[]) => {
      const options = selectArgs[1] as { head?: boolean } | undefined;
      if (options?.head === true) {
        return this.countSelectMock(...selectArgs);
      }
      return { eq: this.courseQuestionsListEqMock };
    },
    delete: this.courseQuestionsDeleteMock,
  }));

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
}
