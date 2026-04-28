import {
  CourseFile,
  SupabaseCourseFile,
} from 'src/domain/teaching/types/course.type';

export function supabaseCourseFileToCourseFile(
  data: SupabaseCourseFile,
): CourseFile {
  return {
    id: data.id,
    courseId: data.course_id,
    fileUrl: data.file_url,
    fileName: data.file_name,
    createdAt: data.created_at,
  };
}
