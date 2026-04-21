import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GenerateQuestionDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsOptional()
  @IsNumber()
  totalQuestions?: number;

  @IsOptional()
  @IsNumber()
  multipleChoiceCount?: number;

  @IsOptional()
  @IsNumber()
  openedCount?: number;
}
