import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { type AuthUser } from 'src/domain/auth/types/auth.type';
import { GetSelfLearnerQuestionsUseCase } from 'src/application/teaching/self-learner-question/get-self-learner-questions.use-case';
import { type SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import { CreateSelfLearnerQuestionsBodyDto } from './dto/create-self-learner-question-body.dto';
import { CreateSelfLearnerQuestionUseCase } from 'src/application/teaching/self-learner-question/create-self-learner-question.use-case';

@Controller('self-learner-question')
export class SelfLearnerQuestionController {
  constructor(
    private readonly getSelfLearnerQuestionsUseCase: GetSelfLearnerQuestionsUseCase,
    private readonly createSelfLearnerQuestionUseCase: CreateSelfLearnerQuestionUseCase,
  ) {}

  @Get('self-learner-course/:courseId')
  async getSelfLearnerQuestions(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<SelfLearnerQuestion[]> {
    return await this.getSelfLearnerQuestionsUseCase.execute(user.id, courseId);
  }

  @Post('self-learner-course/:courseId')
  async createSelfLearnerQuestion(
    @Param('courseId') courseId: string,
    @Body() body: CreateSelfLearnerQuestionsBodyDto,
    @CurrentUser() user: AuthUser,
  ): Promise<SelfLearnerQuestion> {
    return await this.createSelfLearnerQuestionUseCase.execute(
      courseId,
      body,
      user,
    );
  }
}
