import { CourseMapper } from './course.mapper';
import { SupabaseCourse } from 'src/domain/teaching/course/types/course.type';

describe('CourseMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      const result = fixtures.whenToInsertFull();

      fixtures.thenMatchesExpectedInsertFull(result);
    });

    it('omits undefined optional fields on insert', () => {
      const result = fixtures.whenToInsertPartial();

      fixtures.thenMatchesExpectedInsertPartial(result);
    });
  });

  describe('toDomain', () => {
    it('maps Supabase row to domain Course', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedCourse(result);
    });
  });

  describe('validatedQuestionsToDomain', () => {
    it('maps validated_questions column to domain shape', () => {
      const result = fixtures.whenValidatedQuestionsToDomainTrue();

      fixtures.thenMatchesExpectedValidatedTrue(result);
    });

    it('maps false validated_questions', () => {
      const result = fixtures.whenValidatedQuestionsToDomainFalse();

      fixtures.thenMatchesExpectedValidatedFalse(result);
    });
  });

  describe('toUpdate', () => {
    it('maps all provided fields to Supabase column names', () => {
      const result = fixtures.whenToUpdateAllFields();

      fixtures.thenMatchesExpectedUpdateAll(result);
    });

    it('maps only title when description and contentText are absent', () => {
      const result = fixtures.whenToUpdateTitleOnly();

      fixtures.thenMatchesExpectedUpdateTitle(result);
    });

    it('maps null values for description and contentText', () => {
      const result = fixtures.whenToUpdateNullDescriptions();

      fixtures.thenMatchesExpectedUpdateNullDescriptions(result);
    });

    it('returns empty object when no known fields are provided', () => {
      const result = fixtures.whenToUpdateEmpty();

      fixtures.thenMatchesExpectedUpdateEmpty(result);
    });

    it('maps positionOrder to position_order', () => {
      const result = fixtures.whenToUpdatePositionOrder();

      fixtures.thenMatchesExpectedUpdatePosition(result);
    });

    it('maps null positionOrder to null position_order', () => {
      const result = fixtures.whenToUpdateNullPositionOrder();

      fixtures.thenMatchesExpectedUpdateNullPosition(result);
    });

    it('maps validatedQuestions to validated_questions', () => {
      const result = fixtures.whenToUpdateValidatedTrue();

      fixtures.thenMatchesExpectedUpdateValidatedTrue(result);
    });

    it('maps validatedQuestions: false to validated_questions: false', () => {
      const result = fixtures.whenToUpdateValidatedFalse();

      fixtures.thenMatchesExpectedUpdateValidatedFalse(result);
    });

    it('ignores unknown fields', () => {
      const result = fixtures.whenToUpdateWithUnknownAndTitle();

      fixtures.thenMatchesExpectedUpdateIgnoringUnknown(result);
    });
  });
});

class Fixtures {
  public readonly supabaseRow: SupabaseCourse = {
    id: 'c-1',
    session_id: 's-1',
    title: 'Cours',
    description: null,
    text_content: 'Texte',
    validated_questions: true,
    position_order: 2,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedCourse = {
    id: 'c-1',
    sessionId: 's-1',
    title: 'Cours',
    description: null,
    contentText: 'Texte',
    validatedQuestions: true,
    positionOrder: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    questionCount: 0,
  };

  whenToInsertFull() {
    return CourseMapper.toInsert({
      sessionId: 's-1',
      title: 'Titre',
      description: 'D',
      contentText: 'Contenu',
    });
  }

  whenToInsertPartial() {
    return CourseMapper.toInsert({
      sessionId: 's-1',
      title: 'T',
    });
  }

  whenToDomain() {
    return CourseMapper.toDomain(this.supabaseRow);
  }

  whenValidatedQuestionsToDomainTrue() {
    return CourseMapper.validatedQuestionsToDomain({
      validated_questions: true,
    });
  }

  whenValidatedQuestionsToDomainFalse() {
    return CourseMapper.validatedQuestionsToDomain({
      validated_questions: false,
    });
  }

  whenToUpdateAllFields() {
    return CourseMapper.toUpdate({
      title: 'Nouveau titre',
      description: 'Nouvelle description',
      contentText: 'Nouveau contenu',
      positionOrder: 3,
      validatedQuestions: true,
    });
  }

  whenToUpdateTitleOnly() {
    return CourseMapper.toUpdate({ title: 'T' });
  }

  whenToUpdateNullDescriptions() {
    return CourseMapper.toUpdate({ description: null, contentText: null });
  }

  whenToUpdateEmpty() {
    return CourseMapper.toUpdate({});
  }

  whenToUpdatePositionOrder() {
    return CourseMapper.toUpdate({ positionOrder: 2 });
  }

  whenToUpdateNullPositionOrder() {
    return CourseMapper.toUpdate({ positionOrder: null });
  }

  whenToUpdateValidatedTrue() {
    return CourseMapper.toUpdate({ validatedQuestions: true });
  }

  whenToUpdateValidatedFalse() {
    return CourseMapper.toUpdate({ validatedQuestions: false });
  }

  whenToUpdateWithUnknownAndTitle() {
    return CourseMapper.toUpdate({
      unknownField: 'x',
      title: 'T',
    } as Parameters<typeof CourseMapper.toUpdate>[0]);
  }

  thenMatchesExpectedInsertFull(result: unknown) {
    expect(result).toEqual({
      session_id: 's-1',
      title: 'Titre',
      description: 'D',
      text_content: 'Contenu',
      validated_questions: false,
    });
  }

  thenMatchesExpectedInsertPartial(result: unknown) {
    expect(result).toEqual({
      session_id: 's-1',
      title: 'T',
      description: undefined,
      text_content: undefined,
      validated_questions: false,
    });
  }

  thenReturnsExpectedCourse(result: unknown) {
    expect(result).toEqual(this.expectedCourse);
  }

  thenMatchesExpectedValidatedTrue(result: unknown) {
    expect(result).toEqual({ validatedQuestions: true });
  }

  thenMatchesExpectedValidatedFalse(result: unknown) {
    expect(result).toEqual({ validatedQuestions: false });
  }

  thenMatchesExpectedUpdateAll(result: unknown) {
    expect(result).toEqual({
      title: 'Nouveau titre',
      description: 'Nouvelle description',
      text_content: 'Nouveau contenu',
      position_order: 3,
      validated_questions: true,
    });
  }

  thenMatchesExpectedUpdateTitle(result: unknown) {
    expect(result).toEqual({ title: 'T' });
  }

  thenMatchesExpectedUpdateNullDescriptions(result: unknown) {
    expect(result).toEqual({ description: null, text_content: null });
  }

  thenMatchesExpectedUpdateEmpty(result: unknown) {
    expect(result).toEqual({});
  }

  thenMatchesExpectedUpdatePosition(result: unknown) {
    expect(result).toEqual({ position_order: 2 });
  }

  thenMatchesExpectedUpdateNullPosition(result: unknown) {
    expect(result).toEqual({ position_order: null });
  }

  thenMatchesExpectedUpdateValidatedTrue(result: unknown) {
    expect(result).toEqual({ validated_questions: true });
  }

  thenMatchesExpectedUpdateValidatedFalse(result: unknown) {
    expect(result).toEqual({ validated_questions: false });
  }

  thenMatchesExpectedUpdateIgnoringUnknown(result: unknown) {
    expect(result).toEqual({ title: 'T' });
  }
}
