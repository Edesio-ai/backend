import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { CreateQuestionUseCase } from 'src/application/teaching/question/create-question.use-case';
import { DeleteQuestionByIdUseCase } from 'src/application/teaching/question/delete-question-by-id.use-case';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { UpdateQuestionByIdUseCase } from 'src/application/teaching/question/update-question-by-id.use-case';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { GetCourseQuestionsUseCase } from 'src/application/teaching/question/get-course-questions.use-case';

@Roles('teacher')
@Controller('question')
export class QuestionController {
  constructor(
    private readonly getCourseQuestionsUseCase: GetCourseQuestionsUseCase,
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly deleteQuestionByIdUseCase: DeleteQuestionByIdUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionByIdUseCase,
  ) {}

  @Roles('student', 'teacher')
  @Get('course/:courseId')
  async getCourseQuestions(@CurrentUser() user: AuthUser, @Param('courseId') courseId: string): Promise<Question[]> {
    return (await this.getCourseQuestionsUseCase.execute(courseId, user)) || [];
  }

  @Post()
  async createQuestion(@Body() body: CreateQuestionDto, @CurrentUser() user: AuthUser): Promise<{ data: Question }> {
    const question = await this.createQuestionUseCase.execute(body, user);
    return { data: question };
  }

  @Delete(':questionId')
  async deleteQuestionById(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ success: boolean }> {
    const success = await this.deleteQuestionByIdUseCase.execute(questionId, user);
    return { success };
  }

  @Patch(':courseId')
  async updateQuestionById(
    @Param('courseId') courseId: string,
    @Body() body: UpdateQuestionDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ question: Question }> {
    const question = await this.updateQuestionUseCase.execute(courseId, body, user);

    return { question };
  }
}
