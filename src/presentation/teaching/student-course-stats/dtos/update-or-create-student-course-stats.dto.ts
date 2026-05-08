import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateOrCreateStudentCourseStatsBodyDto {
  @IsNumber()
  @IsNotEmpty()
  attemptedQuestions: number;

  @IsNumber()
  @IsNotEmpty()
  correctAnswers: number;
}
