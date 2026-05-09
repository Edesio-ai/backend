import type { CourseRepository } from 'src/domain/teaching/interfaces/course.repository';

export function createMockCourseRepository(): jest.Mocked<CourseRepository> {
  return {
    createCourse: jest.fn(),
    deleteCourseById: jest.fn(),
    deleteCoursesBySessionId: jest.fn(),
    getCourseById: jest.fn(),
    getCourseValidatedQuestions: jest.fn(),
    getCoursesBySessionId: jest.fn(),
    getCourseWithSessionById: jest.fn(),
    getSessionCoursesBySessionId: jest.fn(),
    getSessionCoursesCount: jest.fn(),
    updateCourse: jest.fn(),
  };
}
