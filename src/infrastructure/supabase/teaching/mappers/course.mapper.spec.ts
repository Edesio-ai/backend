import {
  courseCourseBodyToSupabaseCourseInsert,
  mapFilesUrl,
  supabaseCourseFileToCourseFile,
  supabaseCourseToCourse,
  supabaseValidatedQuestionsToValidatedQuestions,
  updatesToSupabaseCourseUpdate,
} from './course.mapper';
import {
  SupabaseCourse,
  SupabaseCourseFile,
} from 'src/domain/teaching/types/course.type';

describe('course.mapper', () => {
  describe('courseCourseBodyToSupabaseCourseInsert', () => {
    it('maps create body to Supabase insert columns', () => {
      expect(
        courseCourseBodyToSupabaseCourseInsert({
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
        courseCourseBodyToSupabaseCourseInsert({
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

  describe('supabaseCourseToCourse', () => {
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

      expect(supabaseCourseToCourse(row)).toEqual({
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

  describe('mapFilesUrl', () => {
    it('maps file_url to fileUrl', () => {
      expect(
        mapFilesUrl([{ file_url: 'a.pdf' }, { file_url: 'b.pdf' }]),
      ).toEqual([{ fileUrl: 'a.pdf' }, { fileUrl: 'b.pdf' }]);
    });

    it('returns empty array for empty input', () => {
      expect(mapFilesUrl([])).toEqual([]);
    });
  });

  describe('supabaseValidatedQuestionsToValidatedQuestions', () => {
    it('maps validated_questions column to domain shape', () => {
      expect(
        supabaseValidatedQuestionsToValidatedQuestions({
          validated_questions: true,
        }),
      ).toEqual({ validatedQuestions: true });
    });

    it('maps false validated_questions', () => {
      expect(
        supabaseValidatedQuestionsToValidatedQuestions({
          validated_questions: false,
        }),
      ).toEqual({ validatedQuestions: false });
    });
  });

  describe('supabaseCourseFileToCourseFile', () => {
    it('maps course file row to domain CourseFile', () => {
      const row: SupabaseCourseFile = {
        id: 'f-1',
        course_id: 'c-1',
        file_url: 'c-1/doc.pdf',
        file_name: 'doc.pdf',
        created_at: '2026-01-01T00:00:00.000Z',
      };

      expect(supabaseCourseFileToCourseFile(row)).toEqual({
        id: 'f-1',
        courseId: 'c-1',
        fileUrl: 'c-1/doc.pdf',
        fileName: 'doc.pdf',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('updatesToSupabaseCourseUpdate', () => {
    it('maps all provided fields to Supabase column names', () => {
      expect(
        updatesToSupabaseCourseUpdate({
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
      expect(updatesToSupabaseCourseUpdate({ title: 'T' })).toEqual({
        title: 'T',
      });
    });

    it('maps null values for description and contentText', () => {
      expect(
        updatesToSupabaseCourseUpdate({
          description: null,
          contentText: null,
        }),
      ).toEqual({
        description: null,
        text_content: null,
      });
    });

    it('returns empty object when no known fields are provided', () => {
      expect(updatesToSupabaseCourseUpdate({})).toEqual({});
    });

    it('maps positionOrder to position_order', () => {
      expect(updatesToSupabaseCourseUpdate({ positionOrder: 2 })).toEqual({
        position_order: 2,
      });
    });

    it('maps null positionOrder to null position_order', () => {
      expect(updatesToSupabaseCourseUpdate({ positionOrder: null })).toEqual({
        position_order: null,
      });
    });

    it('maps validatedQuestions to validated_questions', () => {
      expect(
        updatesToSupabaseCourseUpdate({ validatedQuestions: true }),
      ).toEqual({ validated_questions: true });
    });

    it('maps validatedQuestions: false to validated_questions: false', () => {
      expect(
        updatesToSupabaseCourseUpdate({ validatedQuestions: false }),
      ).toEqual({ validated_questions: false });
    });

    it('ignores unknown fields', () => {
      expect(
        updatesToSupabaseCourseUpdate({ unknownField: 'x', title: 'T' }),
      ).toEqual({ title: 'T' });
    });
  });
});
