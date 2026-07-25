import { SupabaseClient } from '@supabase/supabase-js';
import type { GeneratedQuestion } from 'src/domain/llm/types/openai.type';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { SelfLearnerQuestionRepository } from './self-learner-question.repository';
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
      expect(fixtures.eqAfterDeleteMock).toHaveBeenCalledWith('course_id', fixtures.courseId);
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

      expect(result).toEqual([selfLearnerQuestionMapper.toDomain(fixtures.rows[0])]);
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

  describe('insertSelfLearnerQuestions', () => {
    let fixtures: InsertFixtures;

    beforeEach(() => {
      fixtures = new InsertFixtures();
    });

    it('inserts mapped payloads and maps returned rows', async () => {
      fixtures.whenInsertSucceedsWithRows([fixtures.returnedRows[0]]);

      const result = await fixtures.whenInsert();

      expect(fixtures.insertMock).toHaveBeenCalledWith(
        selfLearnerQuestionMapper.generatedToInserts(fixtures.generatedQuestions, fixtures.courseId),
      );
      expect(result).toEqual([selfLearnerQuestionMapper.toDomain(fixtures.returnedRows[0])]);
      expect(fixtures.fromMock).toHaveBeenCalledWith('self_learner_questions');
      expect(fixtures.selectAfterInsertMock).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when insert response has no data', async () => {
      fixtures.whenInsertReturnsEmptyData();

      const result = await fixtures.whenInsert();

      expect(result).toEqual([]);
    });

    it('throws ServerError when insert fails', async () => {
      fixtures.whenInsertFails('violates FK');

      await expect(fixtures.whenInsert()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('deleteSelfLearnerQuestionById', () => {
    let fixtures: DeleteByIdFixtures;

    beforeEach(() => {
      fixtures = new DeleteByIdFixtures();
    });

    it('calls delete scoped by id', async () => {
      fixtures.whenDeleteSucceeds();

      await fixtures.whenDelete();

      expect(fixtures.fromMock).toHaveBeenCalledWith('self_learner_questions');
      expect(fixtures.deleteMock).toHaveBeenCalledTimes(1);
      expect(fixtures.eqAfterDeleteMock).toHaveBeenCalledWith('id', fixtures.questionId);
    });

    it('throws ServerError when delete fails', async () => {
      fixtures.whenDeleteFails('rls');

      await expect(fixtures.whenDelete()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('getSelfLearnerQuestionById', () => {
    let fixtures: GetByIdFixtures;

    beforeEach(() => {
      fixtures = new GetByIdFixtures();
    });

    it('selects single row by id and maps to domain', async () => {
      fixtures.whenGetByIdSucceeds();

      const result = await fixtures.whenGetById();

      expect(fixtures.fromMock).toHaveBeenCalledWith('self_learner_questions');
      expect(fixtures.selectMock).toHaveBeenCalledWith('*');
      expect(fixtures.eqMock).toHaveBeenCalledWith('id', fixtures.questionId);
      expect(fixtures.singleMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(selfLearnerQuestionMapper.toDomain(fixtures.returnedRow));
    });

    it('throws ServerError when Supabase returns error', async () => {
      fixtures.whenGetByIdFails('not found');

      await expect(fixtures.whenGetById()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('updateSelfLearnerQuestion', () => {
    let fixtures: UpdateFixtures;

    beforeEach(() => {
      fixtures = new UpdateFixtures();
    });

    it('updates scoped by id and returns mapped row', async () => {
      fixtures.whenUpdateSucceeds();

      const result = await fixtures.whenUpdate();

      expect(fixtures.fromMock).toHaveBeenCalledWith('self_learner_questions');
      expect(fixtures.updateMock).toHaveBeenCalledWith(selfLearnerQuestionMapper.toUpdate(fixtures.payload));
      expect(fixtures.eqMock).toHaveBeenCalledWith('id', fixtures.questionId);
      expect(fixtures.singleAfterSelectMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(selfLearnerQuestionMapper.toDomain(fixtures.returnedRow));
    });

    it('throws ServerError when Supabase returns error', async () => {
      fixtures.whenUpdateFails('rls');

      await expect(fixtures.whenUpdate()).rejects.toBeInstanceOf(ServerError);
    });
  });

  describe('createSelfLearnerQuestion', () => {
    let fixtures: CreateFixtures;

    beforeEach(() => {
      fixtures = new CreateFixtures();
    });

    it('inserts mapped payload via toInsert and returns mapped row', async () => {
      fixtures.whenCreateSucceeds();

      const result = await fixtures.whenCreate();

      expect(fixtures.fromMock).toHaveBeenCalledWith('self_learner_questions');
      expect(fixtures.insertMock).toHaveBeenCalledWith(selfLearnerQuestionMapper.toInsert(fixtures.payload));
      expect(fixtures.singleAfterSelectMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(selfLearnerQuestionMapper.toDomain(fixtures.returnedRow));
    });

    it('throws ServerError when Supabase returns error', async () => {
      fixtures.whenCreateFails('unique violation');

      await expect(fixtures.whenCreate()).rejects.toBeInstanceOf(ServerError);
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
      correct_answers: ['A'],
      explanation: 'Parce que',
      created_at: new Date('2026-02-01T10:00:00.000Z'),
    },
    {
      id: 'q-2',
      course_id: this.courseId,
      type: 'open' as const,
      question_text: 'Réponse libre ?',
      proposals: [],
      correct_answers: [],
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

class InsertFixtures {
  public readonly courseId = 'course-insert-q';

  public readonly generatedQuestions: GeneratedQuestion[] = [
    {
      type: 'single',
      questionText: 'Q1?',
      keyConcepts: ['k'],
      proposals: ['A', 'B'],
      correctAnswers: ['A'],
      explanation: 'e1',
    },
  ];

  public readonly returnedRows = [
    {
      id: 'q-new-1',
      course_id: this.courseId,
      type: 'single' as const,
      question_text: 'Q1?',
      proposals: ['A', 'B'],
      correct_answers: ['A'],
      explanation: 'e1',
      created_at: new Date('2026-03-01T09:00:00.000Z'),
    },
  ];

  public readonly fromMock = jest.fn();
  public readonly insertMock = jest.fn();
  public readonly selectAfterInsertMock = jest.fn();

  public readonly repository: SelfLearnerQuestionRepository;

  constructor() {
    this.repository = new SelfLearnerQuestionRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenInsert() {
    return this.repository.insertSelfLearnerQuestions(this.generatedQuestions, this.courseId);
  }

  whenInsertSucceedsWithRows(rows: typeof this.returnedRows) {
    this.selectAfterInsertMock.mockResolvedValue({
      data: rows,
      error: null,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }

  whenInsertReturnsEmptyData() {
    this.selectAfterInsertMock.mockResolvedValue({
      data: null,
      error: null,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }

  whenInsertFails(message: string) {
    this.selectAfterInsertMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }
}

class DeleteByIdFixtures {
  public readonly questionId = 'q-del-by-id';

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
    return this.repository.deleteSelfLearnerQuestionById(this.questionId);
  }

  whenDeleteSucceeds() {
    this.eqAfterDeleteMock.mockResolvedValue({ error: null });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }

  whenDeleteFails(message: string) {
    this.eqAfterDeleteMock.mockResolvedValue({ error: { message } });
    this.deleteMock.mockReturnValue({ eq: this.eqAfterDeleteMock });
    this.fromMock.mockReturnValue({ delete: this.deleteMock });
  }
}

class GetByIdFixtures {
  public readonly questionId = 'q-by-id-1';

  public readonly returnedRow = {
    id: this.questionId,
    course_id: 'course-getbyid',
    type: 'single' as const,
    question_text: 'Une question ?',
    proposals: ['A', 'B'],
    correct_answers: ['A'],
    explanation: 'parce que',
    created_at: new Date('2026-04-01T10:00:00.000Z'),
  };

  public readonly fromMock = jest.fn();
  public readonly selectMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly singleMock = jest.fn();

  public readonly repository: SelfLearnerQuestionRepository;

  constructor() {
    this.repository = new SelfLearnerQuestionRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenGetById() {
    return this.repository.getSelfLearnerQuestionById(this.questionId);
  }

  whenGetByIdSucceeds() {
    this.singleMock.mockResolvedValue({ data: this.returnedRow, error: null });
    this.eqMock.mockReturnValue({ single: this.singleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }

  whenGetByIdFails(message: string) {
    this.singleMock.mockResolvedValue({ data: null, error: { message } });
    this.eqMock.mockReturnValue({ single: this.singleMock });
    this.selectMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ select: this.selectMock });
  }
}

class UpdateFixtures {
  public readonly questionId = 'q-upd-1';

  public readonly payload = {
    questionText: 'Question modifiée ?',
    correctAnswers: ['B'],
  };

  public readonly returnedRow = {
    id: this.questionId,
    course_id: 'course-upd',
    type: 'single' as const,
    question_text: this.payload.questionText,
    proposals: ['A', 'B'],
    correct_answers: this.payload.correctAnswers,
    explanation: 'expl',
    created_at: new Date('2026-04-02T10:00:00.000Z'),
  };

  public readonly fromMock = jest.fn();
  public readonly updateMock = jest.fn();
  public readonly eqMock = jest.fn();
  public readonly selectAfterEqMock = jest.fn();
  public readonly singleAfterSelectMock = jest.fn();

  public readonly repository: SelfLearnerQuestionRepository;

  constructor() {
    this.repository = new SelfLearnerQuestionRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenUpdate() {
    return this.repository.updateSelfLearnerQuestion(this.questionId, this.payload);
  }

  whenUpdateSucceeds() {
    this.singleAfterSelectMock.mockResolvedValue({
      data: this.returnedRow,
      error: null,
    });
    this.selectAfterEqMock.mockReturnValue({
      single: this.singleAfterSelectMock,
    });
    this.eqMock.mockReturnValue({ select: this.selectAfterEqMock });
    this.updateMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ update: this.updateMock });
  }

  whenUpdateFails(message: string) {
    this.singleAfterSelectMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectAfterEqMock.mockReturnValue({
      single: this.singleAfterSelectMock,
    });
    this.eqMock.mockReturnValue({ select: this.selectAfterEqMock });
    this.updateMock.mockReturnValue({ eq: this.eqMock });
    this.fromMock.mockReturnValue({ update: this.updateMock });
  }
}

class CreateFixtures {
  public readonly payload = {
    courseId: 'c-create',
    type: 'single' as const,
    questionText: 'Quelle est la réponse ?',
    proposals: ['A', 'B'],
    correctAnswers: ['A'],
    explanation: 'Parce que A',
  };

  public readonly returnedRow = {
    id: 'sq-new-1',
    course_id: this.payload.courseId,
    type: this.payload.type,
    question_text: this.payload.questionText,
    proposals: this.payload.proposals,
    correct_answers: this.payload.correctAnswers,
    explanation: this.payload.explanation,
    created_at: new Date('2026-03-10T08:00:00.000Z'),
  };

  public readonly fromMock = jest.fn();
  public readonly insertMock = jest.fn();
  public readonly selectAfterInsertMock = jest.fn();
  public readonly singleAfterSelectMock = jest.fn();

  public readonly repository: SelfLearnerQuestionRepository;

  constructor() {
    this.repository = new SelfLearnerQuestionRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenCreate() {
    return this.repository.createSelfLearnerQuestion(this.payload);
  }

  whenCreateSucceeds() {
    this.singleAfterSelectMock.mockResolvedValue({
      data: this.returnedRow,
      error: null,
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterSelectMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }

  whenCreateFails(message: string) {
    this.singleAfterSelectMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterSelectMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }
}
