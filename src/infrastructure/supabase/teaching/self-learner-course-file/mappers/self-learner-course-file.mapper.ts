import {
  SelfLearnerCourseFile,
  SelfLearnerCourseFileInsertPayload,
  SelfLearnerCourseFileInsertPayloadSupabase,
} from 'src/domain/teaching/self-learner-course-file/types/self-learner-course-file.type';

export const selfLearnerCourseFileMapper = {
  toDomain: (data: any): SelfLearnerCourseFile => {
    return {
      id: data.id,
      courseId: data.course_id,
      fileUrl: data.file_url,
      fileName: data.file_name,
      createdAt: data.created_at,
    };
  },
  toInsert: (
    payload: SelfLearnerCourseFileInsertPayload,
  ): SelfLearnerCourseFileInsertPayloadSupabase => {
    return {
      course_id: payload.courseId,
      file_url: payload.fileUrl,
      file_name: payload.fileName,
    };
  },
  toCourseFilesUrls: (data: any): string[] => {
    return data.map((row: any) => row.file_url);
  },
};
