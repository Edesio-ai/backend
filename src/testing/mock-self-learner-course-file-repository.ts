import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';

export function createMockSelfLearnerCourseFileRepository(): jest.Mocked<ISelfLearnerCourseFileRepository> {
  return {
    uploadSelfLearnerCourseFile: jest.fn(),
    getSelfLearnerCourseFiles: jest.fn(),
    getSelfLearnerCourseFilesUrls: jest.fn(),
    deleteSelfLearnerCourseFilesByCourseId: jest.fn(),
  };
}
