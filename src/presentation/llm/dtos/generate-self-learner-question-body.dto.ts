import { IsIn, IsNotEmpty } from 'class-validator';
import { type QuestionType } from 'src/domain/teaching/question/types/question.type';

export class GenerateSelfLearnerQuestionBodyDto {
  @IsIn(['single', 'multiple', 'open'])
  @IsNotEmpty()
  type: QuestionType;
}
