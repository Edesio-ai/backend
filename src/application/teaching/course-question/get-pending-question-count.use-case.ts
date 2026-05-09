import { Inject } from '@nestjs/common';
import {
  QUESTIONS_REPOSITORY,
  type QuestionsRepository,
} from 'src/domain/teaching/interfaces/questions.repository';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from 'src/domain/teaching/interfaces/course.repository';

export class GetPendingQuestionCountUseCase {
  constructor(
    @Inject(QUESTIONS_REPOSITORY)
    private readonly questionsRepository: QuestionsRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(sessionId: string): Promise<number> {
    const courses =
      await this.courseRepository.getCoursesBySessionId(sessionId);
    const courseIds = courses.map((c) => c.id);

    const pendingQuestionCount =
      await this.questionsRepository.getPendingQuestionCount(courseIds);

    return pendingQuestionCount;
  }
}
