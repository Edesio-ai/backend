import { Module } from '@nestjs/common';
import { SelfLearnerQuestionController } from './self-learner-question.controller';
import { GetSelfLearnerQuestionsUseCase } from 'src/application/teaching/self-learner-question/get-self-learner-questions.use-case';
import { SelfLearnerPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner/self-learner-persistence.module';
import { SelfLearnerCoursePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course/self-learner-course-persistence.module';
import { SelfLearnerQuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-question/self-learner-question-persistence.module';
import { CreateSelfLearnerQuestionUseCase } from 'src/application/teaching/self-learner-question/create-self-learner-question.use-case';
import { UpdateSelfLearnerQuestionUseCase } from 'src/application/teaching/self-learner-question/update-self-learner-question.use-case';
import { DeleteSelfLearnerQuestionUseCase } from 'src/application/teaching/self-learner-question/delete-self-learner-question.use-case';

@Module({
  imports: [SelfLearnerPersistenceModule, SelfLearnerCoursePersistenceModule, SelfLearnerQuestionPersistenceModule],
  controllers: [SelfLearnerQuestionController],
  providers: [
    GetSelfLearnerQuestionsUseCase,
    CreateSelfLearnerQuestionUseCase,
    UpdateSelfLearnerQuestionUseCase,
    DeleteSelfLearnerQuestionUseCase,
  ],
})
export class SelfLearnerQuestionModule {}
