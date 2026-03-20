import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import {GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { authPersistenceModule } from '../../infrastructure/persistence/supabase/auth-persistence.module';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';


@Module({
  imports: [authPersistenceModule],
  controllers: [AuthController],
  providers: [
    GetInvitationPreviewUseCase,
    SignUpTeacherUseCase
  ],
})

export class AuthModule {}
