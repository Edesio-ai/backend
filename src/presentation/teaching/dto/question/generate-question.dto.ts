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
  singleCount?: number;

  @IsOptional()
  @IsNumber()
  openedCount?: number;
}
