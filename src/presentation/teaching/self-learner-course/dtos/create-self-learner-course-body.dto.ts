import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { type Language } from 'src/domain/teaching/session/types/session.type';

export class CreateSelfLearnerCourseBodyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  contentText?: string | null;

  @IsIn(['francais', 'anglais', 'espagnol', 'allemand'])
  @IsNotEmpty()
  language: Language;
}
