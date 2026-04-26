import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Question } from 'src/domain/teaching/types/question.type';

export class ExportQuestionsDto {
  @IsArray()
  @IsNotEmpty()
  questions: Question[];

  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @IsString()
  @IsNotEmpty()
  sessionName: string;
}
