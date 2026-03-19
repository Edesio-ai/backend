import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import {GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { InvitationTokenSupabaseModule } from '../../infrastructure/persistence/supabase/invitation-token-supabase.module';


@Module({
  imports: [InvitationTokenSupabaseModule],
  controllers: [AuthController],
  providers: [GetInvitationPreviewUseCase],
})

export class AuthModule {}
