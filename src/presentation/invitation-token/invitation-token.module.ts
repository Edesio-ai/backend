import { Module } from '@nestjs/common';
import { DeleteInvitationTokenUseCase } from 'src/application/establishment/delete-invitation-token.use-case';
import { GetInvitationTokenUseCase } from 'src/application/establishment/get-invitation-token.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { InvitationTokenController } from './invitation-token.controller';
import { TokenPersistenceModule } from 'src/infrastructure/supabase/token/token-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    EstablishmentPersistenceModule,
    TokenPersistenceModule,
  ],
  controllers: [InvitationTokenController],
  providers: [GetInvitationTokenUseCase, DeleteInvitationTokenUseCase],
})
export class InvitationTokenModule {}
