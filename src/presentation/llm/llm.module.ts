import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { GenerateCompletionFeedbackUseCase } from 'src/application/llm/generate-completion-feedback.use-case';
import { OpenaiModule } from 'src/infrastructure/llm/openai/openai.module';

@Module({
  imports: [AuthPersistenceModule, OpenaiModule],
  controllers: [LlmController],
  providers: [GenerateCompletionFeedbackUseCase],
})
export class LlmModule {}
