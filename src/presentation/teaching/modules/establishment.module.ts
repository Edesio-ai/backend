import { Module } from '@nestjs/common';

import { EstablishmentController } from '../controllers/establishment.controller';
import { GetEstablishmentsStatsUseCase } from '../../../application/establishment/get-establishment-stats.use-case';
import { AuthPersistenceModule } from '../../../infrastructure/persistence/supabase/auth/auth-persistence.module';
import { EstablishmentPersistenceModule } from '../../../infrastructure/persistence/supabase/establishment/establishment-persistence.module';
import { StudentPersistenceModule } from '../../../infrastructure/persistence/supabase/student/student-persistence.module';
import { TeacherPersistenceModule } from '../../../infrastructure/persistence/supabase/teacher/teacher-persistence.module';
import { CreateEstablishmentUseCase } from '../../../application/establishment/create-establishment.use-case';
import { GetInvitationTokenUseCase } from '../../../application/establishment/get-invitation-token.use-case';
import { DeleteInvitationTokenUseCase } from '../../../application/establishment/delete-invitation-token.use-case';
import { TokenPersistenceModule } from 'src/infrastructure/persistence/supabase/token/token-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    EstablishmentPersistenceModule,
    StudentPersistenceModule,
    TeacherPersistenceModule,
    TokenPersistenceModule,
  ],
  controllers: [EstablishmentController],
  providers: [
    GetEstablishmentsStatsUseCase,
    CreateEstablishmentUseCase,
    GetInvitationTokenUseCase,
    DeleteInvitationTokenUseCase,
  ],
})
export class EstablishmentModule {}
