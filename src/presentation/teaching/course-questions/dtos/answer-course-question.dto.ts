import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AnswerCourseQuestionBodyDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  courseQuestionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
