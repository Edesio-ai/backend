import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { type QuestionType } from 'src/domain/teaching/question/types/question.type';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsNotEmpty()
  @IsIn(['single', 'multiple', 'open'])
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsOptional()
  @IsArray()
  proposals?: string[];

  @IsArray()
  @IsNotEmpty()
  correctAnswers: string[];

  @IsOptional()
  @IsString()
  explanation?: string | null;
}
