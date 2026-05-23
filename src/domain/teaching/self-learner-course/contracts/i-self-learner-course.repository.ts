import { SelfLearnerCourse } from '../types/self-learner-course.type';

export const SELF_LEARNER_COURSE_REPOSITORY = 'SELF_LEARNER_COURSE_REPOSITORY';

export interface ISelfLearnerCourseRepository {
  getSelfLearnerCourses(selfLearnerId: string): Promise<SelfLearnerCourse[]>;
}
