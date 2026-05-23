import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';

export function createMockSelfLearnerCourseRepository(): jest.Mocked<ISelfLearnerCourseRepository> {
  return {
    getSelfLearnerCourses: jest.fn(),
    getSelfLearnerCoursesCount: jest.fn(),
    createSelfLearnerCourse: jest.fn(),
  };
}
