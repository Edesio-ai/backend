import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseBodyDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  contentText?: string | null;
}
