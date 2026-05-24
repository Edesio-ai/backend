import { SupabaseClient } from '@supabase/supabase-js';
import { SelfLearnerQuestionRepository } from './self-learner-question.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { selfLearnerQuestionMapper } from '../mappers/self-learner-question.mapper';

describe('SelfLearnerQuestionRepository', () => {
  describe('deleteSelfLearnerQuestionsByCourseId', () => {
    let fixtures: DeleteFixtures;

    beforeEach(() => {
      fixtures = new DeleteFixtures();
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

  describe('getSelfLearnerQuestions', () => {
    let fixtures: ListFixtures;

    beforeEach(() => {
      fixtures = new ListFixtures();
    });

    it('maps rows ordered by created_at ascending', async () => {
      fixtures.whenListSucceedsWithRows([fixtures.rows[0]]);

      const result = await fixtures.whenList();

      expect(result).toEqual([
        selfLearnerQuestionMapper.toDomain(fixtures.rows[0]),
      ]);
      fixtures.thenListChainBuilt(fixtures.courseId);
    });

    it('returns empty array when data is null', async () => {
      fixtures.whenListReturnsNull();

      const result = await fixtures.whenList();

      expect(result).toEqual([]);
      fixtures.thenListChainBuilt(fixtures.courseId);
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenListFails('permission');

      await expect(fixtures.whenList()).rejects.toBeInstanceOf(ServerError);
    });
  });
});

class DeleteFixtures {
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

class ListFixtures {
  public readonly courseId = 'course-list-q';

  public readonly rows = [
    {
      id: 'q-1',
      course_id: this.courseId,
      type: 'single' as const,
      question_text: 'Une réponse ?',
      proposals: ['A', 'B'],
      correct_answer: ['A'],
      explanation: 'Parce que',
      created_at: new Date('2026-02-01T10:00:00.000Z'),
    },
    {
      id: 'q-2',
      course_id: this.courseId,
      type: 'open' as const,
      question_text: 'Réponse libre ?',
      proposals: [],
      correct_answer: [],
      explanation: 'OK',
      created_at: new Date('2026-02-02T11:00:00.000Z'),
    },
  ];

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly orderMock = jest.fn();

  public readonly repository: SelfLearnerQuestionRepository;

  constructor() {
    this.repository = new SelfLearnerQuestionRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenList() {
    return this.repository.getSelfLearnerQuestions(this.courseId);
  }

  whenListSucceedsWithRows(rows: typeof this.rows) {
    this.orderMock.mockResolvedValue({
      data: rows,
      error: null,
    });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenListReturnsNull() {
    this.orderMock.mockResolvedValue({ data: null, error: null });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenListFails(message: string) {
    this.orderMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.eqMock.mockReturnValue({ order: this.orderMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  thenListChainBuilt(courseId: string) {
    expect(this.fromMock).toHaveBeenCalledWith('self_learner_questions');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('course_id', courseId);
    expect(this.orderMock).toHaveBeenCalledWith('created_at', {
      ascending: true,
    });
  }
}
