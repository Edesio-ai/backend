import { QuestionMapper } from '../mappers/question.mapper';
import { SupabaseQuestion } from 'src/domain/teaching/question/types/question.type';

describe('QuestionMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps snake_case row to domain Question', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedQuestion(result);
    });
  });

  describe('toInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      const result = fixtures.whenToInsertFull();

      fixtures.thenMatchesExpectedInsertFull(result);
    });

    it('defaults omitted optional fields to null', () => {
      const result = fixtures.whenToInsertMinimal();

      fixtures.thenMatchesExpectedInsertMinimal(result);
    });
  });

  describe('toUpdate', () => {
    it('maps only provided camelCase keys to snake_case', () => {
      const result = fixtures.whenToUpdatePartial();

      fixtures.thenMatchesExpectedUpdatePartial(result);
    });

    it('returns empty object when no fields are set', () => {
      const result = fixtures.whenToUpdateEmpty();

      fixtures.thenMatchesExpectedUpdateEmpty(result);
    });

    it('maps all fields correctly when all are provided', () => {
      const result = fixtures.whenToUpdateAll();

      fixtures.thenMatchesExpectedUpdateAll(result);
    });

    it('maps only type when only type is provided', () => {
      const result = fixtures.whenToUpdateTypeOnly();

      fixtures.thenMatchesExpectedUpdateTypeOnly(result);
    });

    it('maps only positionOrder when only positionOrder is provided', () => {
      const result = fixtures.whenToUpdatePositionOnly();

      fixtures.thenMatchesExpectedUpdatePositionOnly(result);
    });

    it('maps null values for proposals and correctAnswers', () => {
      const result = fixtures.whenToUpdateNullProposals();

      fixtures.thenMatchesExpectedUpdateNullProposals(result);
    });
  });
});

class Fixtures {
  public readonly supabaseRow: SupabaseQuestion = {
    id: 'q-1',
    course_id: 'c-1',
    type: 'single',
    question_text: '2+2 ?',
    proposals: [{ id: 'a', label: '4' }],
    correct_answers: ['a'],
    explanation: 'arithmétique',
    created_at: '2026-01-01T00:00:00.000Z',
    position_order: 1,
    cheating_detection_enabled: true,
  };

  public readonly expectedQuestion = {
    id: 'q-1',
    courseId: 'c-1',
    type: 'single',
    questionText: '2+2 ?',
    proposals: [{ id: 'a', label: '4' }],
    correctAnswers: ['a'],
    explanation: 'arithmétique',
    createdAt: '2026-01-01T00:00:00.000Z',
    positionOrder: 1,
    cheatingDetectionEnabled: true,
  };

  whenToDomain() {
    return QuestionMapper.toDomain(this.supabaseRow);
  }

  whenToInsertFull() {
    return QuestionMapper.toInsert({
      courseId: 'c-1',
      type: 'open',
      questionText: 'Votre avis ?',
      proposals: null,
      correctAnswers: ['oui', 'non'],
      explanation: null,
      positionOrder: 2,
    });
  }

  whenToInsertMinimal() {
    return QuestionMapper.toInsert({
      courseId: 'c-1',
      type: 'single',
      questionText: 'OK',
    });
  }

  whenToUpdatePartial() {
    return QuestionMapper.toUpdate({
      questionText: 'Nouveau libellé',
      correctAnswers: ['a'],
    });
  }

  whenToUpdateEmpty() {
    return QuestionMapper.toUpdate({});
  }

  whenToUpdateAll() {
    return QuestionMapper.toUpdate({
      type: 'multiple',
      questionText: 'Quel est 2+2 ?',
      proposals: ['2', '4', '6', '8'],
      correctAnswers: ['4'],
      explanation: 'Simple addition',
      positionOrder: 3,
      cheatingDetectionEnabled: false,
    });
  }

  whenToUpdateTypeOnly() {
    return QuestionMapper.toUpdate({ type: 'open' });
  }

  whenToUpdatePositionOnly() {
    return QuestionMapper.toUpdate({ positionOrder: 5 });
  }

  whenToUpdateNullProposals() {
    return QuestionMapper.toUpdate({
      proposals: null,
      correctAnswers: null,
    });
  }

  thenReturnsExpectedQuestion(result: unknown) {
    expect(result).toEqual(this.expectedQuestion);
  }

  thenMatchesExpectedInsertFull(result: unknown) {
    expect(result).toEqual({
      course_id: 'c-1',
      type: 'open',
      question_text: 'Votre avis ?',
      proposals: null,
      correct_answers: ['oui', 'non'],
      explanation: null,
      position_order: 2,
      cheating_detection_enabled: true,
    });
  }

  thenMatchesExpectedInsertMinimal(result: unknown) {
    expect(result).toEqual({
      course_id: 'c-1',
      type: 'single',
      question_text: 'OK',
      proposals: null,
      correct_answers: null,
      explanation: null,
      position_order: null,
      cheating_detection_enabled: true,
    });
  }

  thenMatchesExpectedUpdatePartial(result: unknown) {
    expect(result).toEqual({
      question_text: 'Nouveau libellé',
      correct_answers: ['a'],
    });
  }

  thenMatchesExpectedUpdateEmpty(result: unknown) {
    expect(result).toEqual({});
  }

  thenMatchesExpectedUpdateAll(result: unknown) {
    expect(result).toEqual({
      type: 'multiple',
      question_text: 'Quel est 2+2 ?',
      proposals: ['2', '4', '6', '8'],
      correct_answers: ['4'],
      explanation: 'Simple addition',
      position_order: 3,
      cheating_detection_enabled: false,
    });
  }

  thenMatchesExpectedUpdateTypeOnly(result: unknown) {
    expect(result).toEqual({ type: 'open' });
  }

  thenMatchesExpectedUpdatePositionOnly(result: unknown) {
    expect(result).toEqual({ position_order: 5 });
  }

  thenMatchesExpectedUpdateNullProposals(result: unknown) {
    expect(result).toEqual({
      proposals: null,
      correct_answers: null,
    });
  }
}
