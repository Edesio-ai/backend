import { IsNotEmpty, IsString } from 'class-validator';

export class SendCourseQuestionBodyDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;
}
