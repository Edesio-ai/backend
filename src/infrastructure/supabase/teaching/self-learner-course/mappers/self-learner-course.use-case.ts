import {
  SelfLearnerCourse,
  SelfLearnerCourseSupabase,
} from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';

export class SelfLearnerCourseMapper {
  static toDomain(data: SelfLearnerCourseSupabase): SelfLearnerCourse {
    return {
      id: data.id,
      selfLearnerId: data.self_learner_id,
      name: data.name,
      email: data.email,
      createdAt: data.created_at,
    };
  }
}
