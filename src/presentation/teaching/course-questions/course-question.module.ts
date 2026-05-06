import { Module } from '@nestjs/common';
import { GetAnsweredQuestionCountUseCase } from 'src/application/question/get-answered-question-count.use-case';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import { CourseQuestionsController } from './course-questions';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    QuestionPersistenceModule,
    CoursePersistenceModule,
    StudentPersistenceModule,
  ],
  controllers: [CourseQuestionsController],
  providers: [GetPendingQuestionCountUseCase, GetAnsweredQuestionCountUseCase],
})
export class CourseQuestionModule {}
