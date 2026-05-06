import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GenerateCompletionFeedbackUseCase } from 'src/application/llm/generate-completion-feedback.use-case';
import { OpenaiModule } from 'src/infrastructure/llm/openai/openai.module';
import { GenerateQuestionUseCase } from 'src/application/question/generate-question-use-case';
import { EvaluateAnswerUseCase } from 'src/application/question/evaluate-answer.use-case';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { PdfModule } from 'src/infrastructure/pdf/pdf.module';
import { QuestionPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/question-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    TeacherPersistenceModule,
    OpenaiModule,
    CoursePersistenceModule,
    PdfModule,
    QuestionPersistenceModule,
  ],
  controllers: [LlmController],
  providers: [
    GenerateCompletionFeedbackUseCase,
    GenerateQuestionUseCase,
    EvaluateAnswerUseCase,
  ],
})
export class LlmModule {}
