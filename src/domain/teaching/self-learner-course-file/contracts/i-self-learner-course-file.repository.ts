import {
  SelfLearnerCourseFile,
  SelfLearnerCourseFileInsertPayload,
} from '../types/self-learner-course-file.type';

export const SELF_LEARNER_COURSE_FILE_REPOSITORY =
  'SELF_LEARNER_COURSE_FILE_REPOSITORY';

export interface ISelfLearnerCourseFileRepository {
  uploadSelfLearnerCourseFile(
    payload: SelfLearnerCourseFileInsertPayload,
  ): Promise<SelfLearnerCourseFile>;
}
