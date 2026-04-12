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
});

class Fixtures {
  public readonly courseIds = ['course-1', 'course-2'];

  private readonly inMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({ in: this.inMock }));
  private readonly fromMock = jest.fn(() => ({ delete: this.deleteMock }));

  public readonly repository: QuestionSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new QuestionSupabaseRepository(supabaseMock as any);
  }

  whenDeleteQuestionsByCourseIds() {
    return this.repository.deleteQuestionsByCourseIds(this.courseIds);
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

  async thenThrowQuestionServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(QuestionServerError);
  }

  thenDeleteQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('questions');
    expect(this.deleteMock).toHaveBeenCalledTimes(1);
    expect(this.inMock).toHaveBeenCalledWith('course_id', this.courseIds);
  }
}
