import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';

export function createMockSelfLearnerCourseRepository(): jest.Mocked<ISelfLearnerCourseRepository> {
  return {
    getSelfLearnerCourses: jest.fn().mockResolvedValue([]),
    getSelfLearnerCoursesCount: jest.fn().mockResolvedValue(0),
    createSelfLearnerCourse: jest.fn().mockResolvedValue(null),
    getSelfLearnerCourseById: jest.fn().mockResolvedValue(null),
  };
}
