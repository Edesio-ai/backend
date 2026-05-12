import {
  CourseQuestionAnswer,
  CourseQuestionToInsert,
  SupabaseCourseQuestion,
} from 'src/domain/teaching/course-question/types/course-question.type';
import { CourseQuestionMapper } from '../mappers/course-question.mapper';

describe('CourseQuestionMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps a Supabase row to CourseQuestion', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedCourseQuestion(result);
    });
  });

  describe('toInsert', () => {
    it('maps CourseQuestionToInsert to Supabase insert shape', () => {
      const body: CourseQuestionToInsert = {
        courseId: 'course-1',
        studentId: 'student-1',
        questionText: 'Question ?',
      };

      expect(CourseQuestionMapper.toInsert(body)).toEqual({
        course_id: 'course-1',
        student_id: 'student-1',
        question_text: 'Question ?',
      });
    });
  });

  describe('toAnswer', () => {
    it('maps CourseQuestionAnswer to Supabase answer columns', () => {
      const payload: CourseQuestionAnswer = {
        answer: 'La réponse du prof.',
        answeredAt: '2026-05-10T14:30:00.000Z',
      };

      expect(CourseQuestionMapper.toAnswer(payload)).toEqual({
        answer: payload.answer,
        answered_at: payload.answeredAt,
      });
    });
  });
});

class Fixtures {
  public readonly supabaseRow: SupabaseCourseQuestion = {
    id: 'cq-1',
    course_id: 'course-1',
    student_id: 'student-1',
    question_text: 'Pourquoi ?',
    answer: 'Réponse',
    created_at: '2026-01-01T00:00:00.000Z',
    answered_at: '2026-01-02T00:00:00.000Z',
  };

  public readonly expectedCourseQuestion = {
    id: 'cq-1',
    courseId: 'course-1',
    studentId: 'student-1',
    questionText: 'Pourquoi ?',
    answer: 'Réponse',
    createdAt: '2026-01-01T00:00:00.000Z',
    answeredAt: '2026-01-02T00:00:00.000Z',
  };

  whenToDomain() {
    return CourseQuestionMapper.toDomain(this.supabaseRow);
  }

  thenReturnsExpectedCourseQuestion(result: unknown) {
    expect(result).toEqual(this.expectedCourseQuestion);
  }
}
