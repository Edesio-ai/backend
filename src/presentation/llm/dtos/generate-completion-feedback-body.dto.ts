import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GenerateCompletionFeedbackBodyDto {
  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsString()
  @IsNotEmpty()
  studentName: string;
}
