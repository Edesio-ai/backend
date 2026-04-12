import { QuestionController } from '../controllers/question.controller';
import { Module } from '@nestjs/common';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/repositories/course-persistence.module';

@Module({
  imports: [QuestionPersistenceModule, CoursePersistenceModule],
  controllers: [QuestionController],
  providers: [GetPendingQuestionCountUseCase],
})
export class QuestionModule {}
