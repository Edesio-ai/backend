import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { type AuthUser } from 'src/domain/auth/types/auth.type';
import { GetSelfLearnerQuestionsUseCase } from 'src/application/teaching/self-learner-question/get-self-learner-questions.use-case';
import { type SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';

@Controller('self-learner-question')
export class SelfLearnerQuestionController {
  constructor(
    private readonly getSelfLearnerQuestionsUseCase: GetSelfLearnerQuestionsUseCase,
  ) {}

  @Get('self-learner-course/:courseId')
  async getSelfLearnerQuestions(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<SelfLearnerQuestion[]> {
    return await this.getSelfLearnerQuestionsUseCase.execute(user.id, courseId);
  }
}
