import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_REPOSITORY } from 'src/domain/llm/contracts/I-llm.provider';
import { Mistral } from '@mistralai/mistralai';
import { MistralProvider } from './mistral.repository';
import { MISTRAL_CLIENT } from './mistral.constants';

@Module({
  providers: [
    {
      provide: MISTRAL_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('MISTRAL_API_KEY');
        if (!apiKey) throw new Error('MISTRAL_API_KEY is not set');
        return new Mistral({ apiKey });
      },
    },
    {
      provide: LLM_REPOSITORY,
      useClass: MistralProvider,
    },
  ],
  exports: [LLM_REPOSITORY],
})
export class MistralModule {}
