import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
