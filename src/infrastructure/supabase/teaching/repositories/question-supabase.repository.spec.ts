import { QuestionServerError } from 'src/domain/teaching/error';
import { QuestionSupabaseRepository } from './question-supabase.repository';

describe('QuestionSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete questions for course ids', async () => {
    fixtures.whenDeleteSucceeds();

    await fixtures.whenDeleteQuestionsByCourseIds();

    fixtures.thenDeleteQueryBuilt();
  });

  it('should throw QuestionServerError when delete fails', async () => {
    fixtures.whenDeleteFails();

    const promise = fixtures.whenDeleteQuestionsByCourseIds();

    await fixtures.thenThrowQuestionServerError(promise);
  });

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
    fixtures.thenGetPendingCountQueryBuilt();
  });

  it('should throw QuestionServerError when get pending count fails', async () => {
    fixtures.whenGetPendingCountFails();

    const promise = fixtures.whenGetPendingQuestionCount();

    await fixtures.thenThrowQuestionServerError(promise);
    fixtures.thenGetPendingCountQueryBuilt();
  });
});

class Fixtures {
  public readonly courseIds = ['course-1', 'course-2'];

  private readonly inMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({ in: this.inMock }));

  private readonly countSelectMock = jest.fn();
  private readonly countInMock = jest.fn();
  private readonly countIsMock = jest.fn();

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'questions') {
      return { delete: this.deleteMock };
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

    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new QuestionSupabaseRepository(supabaseMock as any);
  }

  whenDeleteQuestionsByCourseIds() {
    return this.repository.deleteQuestionsByCourseIds(this.courseIds);
  }

  whenGetPendingQuestionCount() {
    return this.repository.getPendingQuestionCount(this.courseIds);
  }

  whenDeleteSucceeds() {
    this.inMock.mockResolvedValue({ data: null, error: null });
  }

  whenDeleteFails() {
    this.inMock.mockResolvedValue({
      data: null,
      error: { message: 'delete questions failed' },
    });
  }

  whenGetPendingCountSucceeds(count: number) {
    this.countIsMock.mockResolvedValue({
      count,
      error: null,
    });
  }

  whenGetPendingCountReturnsNull() {
    this.countIsMock.mockResolvedValue({
      count: null,
      error: null,
    });
  }

  whenGetPendingCountFails() {
    this.countIsMock.mockResolvedValue({
      count: null,
      error: { message: 'count query failed' },
    });
  }

  async thenThrowQuestionServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(QuestionServerError);
  }

  thenDeleteQueryBuilt() {
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
    expect(this.countIsMock).toHaveBeenCalledTimes(1);
  }
}
