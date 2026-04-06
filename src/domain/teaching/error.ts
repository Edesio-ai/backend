export abstract class TeachingError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
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
