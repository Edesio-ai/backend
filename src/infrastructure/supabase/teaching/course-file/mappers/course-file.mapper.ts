import { CourseFile, SupabaseCourseFile } from 'src/domain/teaching/course-file/types/course-file.type';

export const courseFileMapper = {
  toDomain: (data: SupabaseCourseFile): CourseFile => ({
    id: data.id,
    courseId: data.course_id,
    fileUrl: data.file_url,
    fileName: data.file_name,
    createdAt: data.created_at,
  }),
  fileUrlsToDomain: (files: { file_url: string }[]): { fileUrl: string }[] =>
    files.map((f) => ({ fileUrl: f.file_url })),
};
