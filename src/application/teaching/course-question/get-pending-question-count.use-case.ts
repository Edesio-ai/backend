import { Inject } from '@nestjs/common';
import { COURSE_REPOSITORY, type ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import {
  COURSE_QUESTION_REPOSITORY,
  type ICourseQuestionRepository,
} from 'src/domain/teaching/course-question/contracts/i-course-question.repository';

export class GetPendingQuestionCountUseCase {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly courseQuestionRepository: ICourseQuestionRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(sessionId: string): Promise<number> {
    const courses = await this.courseRepository.getCoursesBySessionId(sessionId);
    const courseIds = courses.map((c) => c.id);

    const pendingQuestionCount = await this.courseQuestionRepository.getPendingQuestionCount(courseIds);

    return pendingQuestionCount;
  }
}
