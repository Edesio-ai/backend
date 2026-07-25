import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { type QuestionType } from 'src/domain/teaching/question/types/question.type';

export class CreateSelfLearnerQuestionsBodyDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['single', 'multiple', 'open'], { message: 'Invalid question type' })
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsArray()
  @IsOptional()
  proposals?: string[];

  @IsArray()
  @IsNotEmpty()
  correctAnswers: string[];

  @IsString()
  @IsOptional()
  explanation: string;
}
