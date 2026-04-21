import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { OpenaiRepository } from './openai.repository';
import { OPENAI_REPOSITORY } from 'src/domain/shared/llm/openai/contracts/opena-ai.repository';
import { OPENAI_CLIENT } from './openai.constants';

@Module({
  providers: [
    {
      provide: OPENAI_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const key = configService.get<string>('OPENAI_API_KEY');
        if (!key) throw new Error('OPENAI_API_KEY is not set');
        return new OpenAI({ apiKey: key });
      },
    },
    {
      provide: OPENAI_REPOSITORY,
      useClass: OpenaiRepository,
    },
  ],
  exports: [OPENAI_CLIENT, OPENAI_REPOSITORY],
})
export class OpenaiModule {}
