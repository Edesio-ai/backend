import { SupabaseClient } from '@supabase/supabase-js';
import { SelfLearnerQuestionRepository } from './self-learner-question.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

describe('SelfLearnerQuestionRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('calls delete scoped by course_id', async () => {
    fixtures.whenDeleteSucceeds();

    await fixtures.whenDelete();

    expect(fixtures.fromMock).toHaveBeenCalledWith('self_learner_questions');
    expect(fixtures.deleteMock).toHaveBeenCalledTimes(1);
    expect(fixtures.eqAfterDeleteMock).toHaveBeenCalledWith(
      'course_id',
      fixtures.courseId,
    );
  });

  it('throws ServerError when delete fails', async () => {
    fixtures.whenDeleteFails('rls');

    await expect(fixtures.whenDelete()).rejects.toBeInstanceOf(ServerError);
  });
});

class Fixtures {
  public readonly courseId = 'course-q';

  public readonly fromMock = jest.fn();
  public readonly deleteMock = jest.fn();
  public readonly eqAfterDeleteMock = jest.fn();

  public readonly repository: SelfLearnerQuestionRepository;

  constructor() {
    this.repository = new SelfLearnerQuestionRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenDelete() {
    return this.repository.deleteSelfLearnerQuestionsByCourseId(this.courseId);
  }

  whenDeleteSucceeds() {
    this.eqAfterDeleteMock.mockResolvedValue({ error: null });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }

  whenDeleteFails(message: string) {
    this.eqAfterDeleteMock.mockResolvedValue({
      error: { message },
    });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }
}
