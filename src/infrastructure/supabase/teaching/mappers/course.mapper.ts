import {
  Course,
  CourseFile,
  CourseFileUpload,
  CreateCourseBody,
  SupabaseCourse,
  SupabaseCourseFile,
} from 'src/domain/teaching/types/course.type';

type SupabaseCourseInsert = {
  session_id: string;
  title: string;
  description?: string | null;
  text_content?: string | null;
};

export function courseCourseBodyToSupabaseCourseInsert(
  course: CreateCourseBody,
): SupabaseCourseInsert {
  return {
    session_id: course.sessionId,
    title: course.title,
    description: course.description,
    text_content: course.contentText,
  };
}

export function supabaseCourseToCourse(course: SupabaseCourse): Course {
  return {
    id: course.id,
    sessionId: course.session_id,
    title: course.title,
    description: course.description,
    contentText: course.text_content,
    validatedQuestions: course.validated_questions,
    positionOrder: course.position_order,
    createdAt: course.created_at,
  };
}

export function mapFilesUrl(
  files: { file_url: string }[],
): { fileUrl: string }[] {
  return files.map((file) => ({
    fileUrl: file.file_url,
  }));
}

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

export function supabaseValidatedQuestionsToValidatedQuestions(data: {
  validated_questions: boolean;
}): { validatedQuestions: boolean } {
  return {
    validatedQuestions: data.validated_questions,
  };
}
