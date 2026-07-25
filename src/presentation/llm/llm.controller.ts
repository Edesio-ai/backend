import { Body, Controller, Param, Post } from '@nestjs/common';

import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { GenerateCompletionFeedbackBodyDto } from './dtos/generate-completion-feedback-body.dto';
import { GenerateCompletionFeedbackUseCase } from 'src/application/llm/generate-completion-feedback.use-case';
import { GenerateQuestionDto } from 'src/presentation/llm/dtos/generate-question.dto';
import { Question } from 'src/domain/teaching/question/types/question.type';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { GenerateQuestionUseCase } from 'src/application/llm/generate-question-use-case';
import { EvaluateAnswerResponse } from 'src/domain/llm/types/openai.type';
import { EvaluateAnswerDto } from './dtos/evaluate-answer.dto';
import { EvaluateAnswerUseCase } from 'src/application/llm/evaluate-answer.use-case';
import { SelfLearnerQuestion } from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';
import { GenerateSelfLearnerQuestionBodyDto } from './dtos/generate-self-learner-question-body.dto';
import { GenerateSelfLearnerQuestionUseCase } from 'src/application/llm/generate-self-learner-question.use-case';

@Roles('teacher', 'self-learner')
@Controller('llm')
export class LlmController {
  constructor(
    private readonly generateCompletionFeedbackUseCase: GenerateCompletionFeedbackUseCase,
    private readonly generateQuestionUseCase: GenerateQuestionUseCase,
    private readonly evaluateAnswerUseCase: EvaluateAnswerUseCase,
    private readonly generateSelfLearnerQuestionUseCase: GenerateSelfLearnerQuestionUseCase,
  ) {}

  @Roles('student', 'teacher', 'self-learner')
  @Post('completion-feedback')
  async generateCompletionFeedback(@Body() body: GenerateCompletionFeedbackBodyDto): Promise<{ feedback: string }> {
    const feedback = await this.generateCompletionFeedbackUseCase.execute(body);
    return { feedback };
  }

  @Post('generate-questions')
  async generateQuestion(
    @CurrentUser() user: AuthUser,
    @Body() body: GenerateQuestionDto,
  ): Promise<{
    questions: Question[] | SelfLearnerQuestion[];
    questionCount: number;
  }> {
    const questions = await this.generateQuestionUseCase.execute(body, user);
    return {
      questions,
      questionCount: questions.length,
    };
  }
  @Roles('student', 'teacher', 'self-learner')
  @Post('evaluate-answer')
  async evaluateAnswer(@Body() body: EvaluateAnswerDto): Promise<EvaluateAnswerResponse> {
    return await this.evaluateAnswerUseCase.execute(body);
  }

  @Roles('self-learner')
  @Post('generate-self-learner-question/self-learner-course/:selfLearnerCourseId')
  async generateSelfLearnerQuestion(
    @Param('selfLearnerCourseId') selfLearnerCourseId: string,
    @Body() body: GenerateSelfLearnerQuestionBodyDto,
    @CurrentUser() user: AuthUser,
  ): Promise<SelfLearnerQuestion> {
    return await this.generateSelfLearnerQuestionUseCase.execute(user, body.type, selfLearnerCourseId);
  }
}
