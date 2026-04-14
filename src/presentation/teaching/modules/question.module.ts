import { QuestionController } from '../controllers/question.controller';
import { Module } from '@nestjs/common';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/repositories/course-persistence.module';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseQuestionsUseCase } from 'src/application/question/get-course-questions.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    QuestionPersistenceModule,
    CoursePersistenceModule,
    TeacherPersistenceModule,
  ],
  controllers: [QuestionController],
  providers: [GetPendingQuestionCountUseCase, GetCourseQuestionsUseCase],
})
export class QuestionModule {}
