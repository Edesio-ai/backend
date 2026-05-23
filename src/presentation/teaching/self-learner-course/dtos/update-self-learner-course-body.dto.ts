import { IsOptional, IsString } from 'class-validator';

export class UpdateSelfLearnerCourseBodyDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contentText?: string;
}
