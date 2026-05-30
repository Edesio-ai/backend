import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSelfLearnerQuestionBodyDto {
  @IsNotEmpty()
  @IsString()
  questionText: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  correctAnswers: string[];
}
