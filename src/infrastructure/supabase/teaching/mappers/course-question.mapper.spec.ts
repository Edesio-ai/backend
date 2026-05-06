import { CourseQuestionMapper } from './course-question.mapper';
import { SupabaseCourseQuestion } from 'src/domain/teaching/types/course-question.type';

describe('CourseQuestionMapper', () => {
  describe('toDomain', () => {
    it('maps a Supabase row to CourseQuestion', () => {
      const row: SupabaseCourseQuestion = {
        id: 'cq-1',
        course_id: 'course-1',
        student_id: 'student-1',
        question_text: 'Pourquoi ?',
        answer: 'Réponse',
        created_at: '2026-01-01T00:00:00.000Z',
        answered_at: '2026-01-02T00:00:00.000Z',
      };

      expect(CourseQuestionMapper.toDomain(row)).toEqual({
        id: 'cq-1',
        courseId: 'course-1',
        studentId: 'student-1',
        questionText: 'Pourquoi ?',
        answer: 'Réponse',
        createdAt: '2026-01-01T00:00:00.000Z',
        answeredAt: '2026-01-02T00:00:00.000Z',
      });
    });
  });
});
