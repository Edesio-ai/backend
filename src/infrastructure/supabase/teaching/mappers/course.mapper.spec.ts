import { CourseMapper } from './course.mapper';
import { SupabaseCourse } from 'src/domain/teaching/types/course.type';

describe('CourseMapper', () => {
  describe('toInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      expect(
        CourseMapper.toInsert({
          sessionId: 's-1',
          title: 'Titre',
          description: 'D',
          contentText: 'Contenu',
        }),
      ).toEqual({
        session_id: 's-1',
        title: 'Titre',
        description: 'D',
        text_content: 'Contenu',
      });
    });

    it('omits undefined optional fields on insert', () => {
      expect(
        CourseMapper.toInsert({
          sessionId: 's-1',
          title: 'T',
        }),
      ).toEqual({
        session_id: 's-1',
        title: 'T',
        description: undefined,
        text_content: undefined,
      });
    });
  });

  describe('toDomain', () => {
    it('maps Supabase row to domain Course', () => {
      const row: SupabaseCourse = {
        id: 'c-1',
        session_id: 's-1',
        title: 'Cours',
        description: null,
        text_content: 'Texte',
        validated_questions: true,
        position_order: 2,
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(CourseMapper.toDomain(row)).toEqual({
        id: 'c-1',
        sessionId: 's-1',
        title: 'Cours',
        description: null,
        contentText: 'Texte',
        validatedQuestions: true,
        positionOrder: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('fileUrlsToDomain', () => {
    it('maps file_url to fileUrl', () => {
      expect(
        CourseMapper.fileUrlsToDomain([
          { file_url: 'a.pdf' },
          { file_url: 'b.pdf' },
        ]),
      ).toEqual([{ fileUrl: 'a.pdf' }, { fileUrl: 'b.pdf' }]);
    });

    it('returns empty array for empty input', () => {
      expect(CourseMapper.fileUrlsToDomain([])).toEqual([]);
    });
  });

  describe('validatedQuestionsToDomain', () => {
    it('maps validated_questions column to domain shape', () => {
      expect(
        CourseMapper.validatedQuestionsToDomain({ validated_questions: true }),
      ).toEqual({ validatedQuestions: true });
    });

    it('maps false validated_questions', () => {
      expect(
        CourseMapper.validatedQuestionsToDomain({ validated_questions: false }),
      ).toEqual({ validatedQuestions: false });
    });
  });

  describe('toUpdate', () => {
    it('maps all provided fields to Supabase column names', () => {
      expect(
        CourseMapper.toUpdate({
          title: 'Nouveau titre',
          description: 'Nouvelle description',
          contentText: 'Nouveau contenu',
          positionOrder: 3,
          validatedQuestions: true,
        }),
      ).toEqual({
        title: 'Nouveau titre',
        description: 'Nouvelle description',
        text_content: 'Nouveau contenu',
        position_order: 3,
        validated_questions: true,
      });
    });

    it('maps only title when description and contentText are absent', () => {
      expect(CourseMapper.toUpdate({ title: 'T' })).toEqual({ title: 'T' });
    });

    it('maps null values for description and contentText', () => {
      expect(
        CourseMapper.toUpdate({ description: null, contentText: null }),
      ).toEqual({ description: null, text_content: null });
    });

    it('returns empty object when no known fields are provided', () => {
      expect(CourseMapper.toUpdate({})).toEqual({});
    });

    it('maps positionOrder to position_order', () => {
      expect(CourseMapper.toUpdate({ positionOrder: 2 })).toEqual({
        position_order: 2,
      });
    });

    it('maps null positionOrder to null position_order', () => {
      expect(CourseMapper.toUpdate({ positionOrder: null })).toEqual({
        position_order: null,
      });
    });

    it('maps validatedQuestions to validated_questions', () => {
      expect(CourseMapper.toUpdate({ validatedQuestions: true })).toEqual({
        validated_questions: true,
      });
    });

    it('maps validatedQuestions: false to validated_questions: false', () => {
      expect(CourseMapper.toUpdate({ validatedQuestions: false })).toEqual({
        validated_questions: false,
      });
    });

    it('ignores unknown fields', () => {
      expect(CourseMapper.toUpdate({ unknownField: 'x', title: 'T' })).toEqual({
        title: 'T',
      });
    });
  });
});
