import { QuestionController } from '../controllers/question.controller';
import { Module } from '@nestjs/common';
import { GetPendingQuestionCountUseCase } from 'src/application/question/get-pending-question-count.use-case';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GetCourseQuestionsUseCase } from 'src/application/question/get-course-questions.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { GenerateQuestionUseCase } from 'src/application/question/generate-question-use-case';
import { PdfModule } from 'src/infrastructure/pdf/pdf.module';
import { OpenaiModule } from 'src/infrastructure/llm/openai/openai.module';
import { CreateQuestionUseCase } from 'src/application/question/create-question.use-case';
import { DeleteQuestionByIdUseCase } from 'src/application/question/delete-question-by-id.use-case';

@Module({
  imports: [
    AuthPersistenceModule,
    QuestionPersistenceModule,
    CoursePersistenceModule,
    TeacherPersistenceModule,
    PdfModule,
    OpenaiModule,
  ],
  controllers: [QuestionController],
  providers: [
    GetPendingQuestionCountUseCase,
    GetCourseQuestionsUseCase,
    GenerateQuestionUseCase,
    CreateQuestionUseCase,
    DeleteQuestionByIdUseCase,
  ],
})
export class QuestionModule {}
