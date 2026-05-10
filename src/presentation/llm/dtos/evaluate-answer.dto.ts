import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EvaluateAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  questionText: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  correctAnswer: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  answer: string;

  @IsString()
  @IsNotEmpty()
  explanation: string;
}
