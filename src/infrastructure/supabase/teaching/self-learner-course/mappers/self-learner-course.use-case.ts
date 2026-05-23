import {
  SelfLearnerCourse,
  SelfLearnerCourseInsertPayload,
  SelfLearnerCourseInsertSupabase,
  SelfLearnerCourseSupabase,
} from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';

export class SelfLearnerCourseMapper {
  static toInsert(
    payload: SelfLearnerCourseInsertPayload,
  ): SelfLearnerCourseInsertSupabase {
    return {
      self_learner_id: payload.selfLearnerId,
      title: payload.title,
      description: payload.description ?? null,
      text_content: payload.textContent ?? null,
      language: payload.language,
    };
  }
  static toDomain(data: SelfLearnerCourseSupabase): SelfLearnerCourse {
    return {
      id: data.id,
      selfLearnerId: data.self_learner_id,
      title: data.title,
      description: data.description ?? null,
      textContent: data.text_content ?? null,
      language: data.language,
      createdAt: data.created_at,
    };
  }
}
