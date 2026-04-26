import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { type QuestionType } from 'src/domain/teaching/types/question.type';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  questionText?: string | undefined;

  @IsArray()
  @IsOptional()
  correctAnswers?: string[] | undefined;

  @IsString()
  @IsOptional()
  explanation?: string | undefined;

  @IsIn(['single', 'multiple', 'open'])
  @IsOptional()
  type?: QuestionType | undefined;

  @IsArray()
  @IsOptional()
  proposals?: string[] | undefined;
}
