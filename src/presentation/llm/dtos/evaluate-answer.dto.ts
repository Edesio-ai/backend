import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { type Language } from 'src/domain/teaching/session/types/session.type';

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

  /** Course/session language — chatbot feedback must be written in this language. */
  @IsOptional()
  @IsIn(['francais', 'anglais', 'espagnol', 'allemand'])
  language?: Language;
}
