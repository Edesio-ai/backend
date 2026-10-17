import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { type Language } from 'src/domain/teaching/session/types/session.type';

export class CompletionFeedbackConceptDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  score: number;
}

export class CompletionFeedbackAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  score: number;

  @IsOptional()
  @IsString()
  studentAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  missingElements?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompletionFeedbackConceptDto)
  concepts?: CompletionFeedbackConceptDto[];
}

export class GenerateCompletionFeedbackBodyDto {
  @IsUUID()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompletionFeedbackAnswerDto)
  answers: CompletionFeedbackAnswerDto[];

  @IsString()
  @IsOptional()
  studentName?: string;

  /** Course/session language — feedback must be written in this language. */
  @IsOptional()
  @IsIn(['francais', 'anglais', 'espagnol', 'allemand'])
  language?: Language;
}
