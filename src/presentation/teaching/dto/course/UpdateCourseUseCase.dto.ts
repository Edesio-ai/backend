import { IsOptional, IsString } from 'class-validator';

export class UpdateCourseBodyDto {
  @IsString()
  @IsOptional()
  title?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  contentText?: string | null;
}
