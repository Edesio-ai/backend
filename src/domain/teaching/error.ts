export abstract class TeachingError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export class TeacheServerError extends TeachingError {
  readonly code = 'TEACHER_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Teacher server error');
  }
}

export class TeacherBadRequestError extends TeachingError {
  readonly code = 'TEACHER_BAD_REQUEST';
  readonly httpStatus = 400;
  constructor(message?: string) {
    super(message || 'Teacher bad request');
  }
}

export class TeacherNotFoundError extends TeachingError {
  readonly code = 'TEACHER_NOT_FOUND';
  readonly httpStatus = 404;
  constructor(message?: string) {
    super(message || 'Teacher not found');
  }
}

export class TeacherSessionsNotFoundError extends TeachingError {
  readonly code = 'TEACHER_SESSIONS_NOT_FOUND';
  readonly httpStatus = 404;
  constructor(message?: string) {
    super(message || 'Teacher sessions not found');
  }
}

export class StudentSessionsNotFoundError extends TeachingError {
  readonly code = 'STUDENT_SESSIONS_NOT_FOUND';
  readonly httpStatus = 404;
  constructor(message?: string) {
    super(message || 'Student sessions not found');
  }
}

export class SessionServerError extends TeachingError {
  readonly code = 'SESSION_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Session server error');
  }
}

export class CourseServerError extends TeachingError {
  readonly code = 'COURSE_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Course server error');
  }
}

export class QuestionServerError extends TeachingError {
  readonly code = 'QUESTION_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Question server error');
  }
}
