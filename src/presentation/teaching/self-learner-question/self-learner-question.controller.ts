import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { type AuthUser } from 'src/domain/auth/types/auth.type';
import { GetSelfLearnerQuestionsUseCase } from 'src/application/teaching/self-learner-question/get-self-learner-questions.use-case';
import { type SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import { CreateSelfLearnerQuestionsBodyDto } from './dto/create-self-learner-question-body.dto';
import { CreateSelfLearnerQuestionUseCase } from 'src/application/teaching/self-learner-question/create-self-learner-question.use-case';
import { UpdateSelfLearnerQuestionBodyDto } from './dto/update-self-learner-question-body.dto';
import { UpdateSelfLearnerQuestionUseCase } from 'src/application/teaching/self-learner-question/update-self-learner-question.use-case';
import { DeleteSelfLearnerQuestionUseCase } from 'src/application/teaching/self-learner-question/delete-self-learner-question.use-case';

@Controller('self-learner-question')
export class SelfLearnerQuestionController {
  constructor(
    private readonly getSelfLearnerQuestionsUseCase: GetSelfLearnerQuestionsUseCase,
    private readonly createSelfLearnerQuestionUseCase: CreateSelfLearnerQuestionUseCase,
    private readonly updateSelfLearnerQuestionUseCase: UpdateSelfLearnerQuestionUseCase,
    private readonly deleteSelfLearnerQuestionUseCase: DeleteSelfLearnerQuestionUseCase,
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
    return await this.createSelfLearnerQuestionUseCase.execute(courseId, body, user);
  }

  @Patch(':questionId')
  async updateSelfLearnerQuestion(
    @Param('questionId') questionId: string,
    @Body() body: UpdateSelfLearnerQuestionBodyDto,
    @CurrentUser() user: AuthUser,
  ): Promise<SelfLearnerQuestion> {
    return await this.updateSelfLearnerQuestionUseCase.execute(questionId, body, user);
  }

  @Delete(':questionId')
  async deleteSelfLearnerQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return await this.deleteSelfLearnerQuestionUseCase.execute(user, questionId);
  }
}
