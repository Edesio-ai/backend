import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { TeachingModule } from './teaching/teaching.module';
import { ExportModule } from './export/modules/export.module';
import { LlmModule } from './llm/modules/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    BillingModule,
    TeachingModule,
    ExportModule,
    LlmModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
