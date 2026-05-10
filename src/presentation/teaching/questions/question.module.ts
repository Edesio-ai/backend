import { QuestionController } from './question.controller';
import { Module } from '@nestjs/common';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseQuestionsUseCase } from 'src/application/teaching/question/get-course-questions.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { CreateQuestionUseCase } from 'src/application/teaching/question/create-question.use-case';
import { DeleteQuestionByIdUseCase } from 'src/application/teaching/question/delete-question-by-id.use-case';
import { UpdateQuestionByIdUseCase } from 'src/application/teaching/question/update-question-by-id.use-case';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/question/question-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    QuestionPersistenceModule,
    CoursePersistenceModule,
    TeacherPersistenceModule,
    StudentPersistenceModule,
  ],
  controllers: [QuestionController],
  providers: [
    GetCourseQuestionsUseCase,
    CreateQuestionUseCase,
    DeleteQuestionByIdUseCase,
    UpdateQuestionByIdUseCase,
  ],
})
export class QuestionModule {}
