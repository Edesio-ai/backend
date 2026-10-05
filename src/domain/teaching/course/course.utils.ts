type CoursePublication = {
  validatedQuestions?: boolean | null;
};

export function isCourseVisibleToStudents(course: CoursePublication): boolean {
  return course.validatedQuestions !== false;
}
