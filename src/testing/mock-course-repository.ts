import type { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';

export function createMockCourseRepository(): jest.Mocked<ICourseRepository> {
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
