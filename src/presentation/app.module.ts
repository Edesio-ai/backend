import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { TeachingModule } from './teaching/teaching.module';
import { ExportModule } from './export/export.module';
import { LlmModule } from './llm/llm.module';
import { InvitationTokenModule } from './invitation-token/invitation-token.module';
import { EmailModule } from './email/email.module';
import { ProfileModule } from './profile/profile.module';
import { SuggestionModule } from './suggestion/suggestion.module';

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
    InvitationTokenModule,
    EmailModule,
    InvitationTokenModule,
    ProfileModule,
    SuggestionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
