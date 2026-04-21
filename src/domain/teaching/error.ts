export abstract class TeachingError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

// TEACHER ERRORS
export class TeacherSessionsNotFoundError extends TeachingError {
  readonly code = 'TEACHER_SESSIONS_NOT_FOUND';
  readonly httpStatus = 404;
  constructor(message?: string) {
    super(message || 'Teacher sessions not found');
  }
}

export class TeacherNotFoundError extends TeachingError {
  readonly code = 'TEACHER_NOT_FOUND';
  readonly httpStatus = 404;
  constructor(message?: string) {
    super(message || 'Teacher not found');
  }
}

export class TeacherBadRequestError extends TeachingError {
  readonly code = 'TEACHER_BAD_REQUEST';
  readonly httpStatus = 400;
  constructor(message?: string) {
    super(message || 'Teacher bad request');
  }
}

export class TeacheServerError extends TeachingError {
  readonly code = 'TEACHER_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Teacher server error');
  }
}

// STUDENT ERRORS
export class StudentServerError extends TeachingError {
  readonly code = 'STUDENT_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Student server error');
  }
}

// SESSION ERRORS
export class SessionServerError extends TeachingError {
  readonly code = 'SESSION_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Session server error');
  }
}

// QUESTION ERRORS
export class QuestionServerError extends TeachingError {
  readonly code = 'QUESTION_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Question server error');
  }
}

export class QuestionBadRequestError extends TeachingError {
  readonly code = 'QUESTION_BAD_REQUEST';
  readonly httpStatus = 400;
  constructor(message?: string) {
    super(message || 'Question bad request');
  }
}

// COURSE ERRORS
export class CourseNotFoundError extends TeachingError {
  readonly code = 'COURSE_NOT_FOUND';
  readonly httpStatus = 404;
  constructor(message?: string) {
    super(message || 'Course not found');
  }
}

export class CourseServerError extends TeachingError {
  readonly code = 'COURSE_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Course server error');
  }
}
