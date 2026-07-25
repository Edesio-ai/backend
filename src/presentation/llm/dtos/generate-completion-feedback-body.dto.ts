import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { type Language } from 'src/domain/teaching/session/types/session.type';

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
  @IsOptional()
  studentName?: string;

  /** Course/session language — feedback must be written in this language. */
  @IsOptional()
  @IsIn(['francais', 'anglais', 'espagnol', 'allemand'])
  language?: Language;
}
