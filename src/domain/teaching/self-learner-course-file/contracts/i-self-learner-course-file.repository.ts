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
  getSelfLearnerCourseFiles(courseId: string): Promise<SelfLearnerCourseFile[]>;
  getSelfLearnerCourseFilesUrls(courseId: string): Promise<string[]>;
  deleteSelfLearnerCourseFilesByCourseId(courseId: string): Promise<void>;
  getSelfLearnerCourseFileById(fileId: string): Promise<SelfLearnerCourseFile>;
  deleteSelfLearnerCourseFileById(fileId: string): Promise<void>;
  getSelfLearnerCourseFileSignedUrl(fileUrl: string): Promise<string | null>;
}
