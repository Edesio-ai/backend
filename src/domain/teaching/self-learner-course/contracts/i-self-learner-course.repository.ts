import {
  SelfLearnerCourse,
  SelfLearnerCourseInsertPayload,
  UpdateSelfLearnerCoursePayload,
} from '../types/self-learner-course.type';

export const SELF_LEARNER_COURSE_REPOSITORY = 'SELF_LEARNER_COURSE_REPOSITORY';

export interface ISelfLearnerCourseRepository {
  getSelfLearnerCourses(selfLearnerId: string): Promise<SelfLearnerCourse[]>;
  getSelfLearnerCoursesCount(selfLearnerId: string): Promise<number>;
  createSelfLearnerCourse(
    payload: SelfLearnerCourseInsertPayload,
  ): Promise<SelfLearnerCourse>;
  getSelfLearnerCourseById(courseId: string): Promise<SelfLearnerCourse | null>;
  updateSelfLearnerCourse(
    courseId: string,
    payload: UpdateSelfLearnerCoursePayload,
  ): Promise<SelfLearnerCourse>;
}
