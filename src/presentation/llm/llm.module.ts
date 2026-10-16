import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GenerateCompletionFeedbackUseCase } from 'src/application/llm/generate-completion-feedback.use-case';
import { GenerateQuestionUseCase } from 'src/application/llm/generate-question-use-case';
import { EvaluateAnswerUseCase } from 'src/application/llm/evaluate-answer.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { PdfModule } from 'src/infrastructure/pdf/pdf.module';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/question/question-persistence.module';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';
import { MistralModule } from 'src/infrastructure/llm/mistral/mistral.module';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    MistralModule,
    CourseFilePersistenceModule,
    CoursePersistenceModule,
    PdfModule,
    QuestionPersistenceModule,
  ],
  controllers: [LlmController],
  providers: [GenerateCompletionFeedbackUseCase, GenerateQuestionUseCase, EvaluateAnswerUseCase],
})
export class LlmModule {}
