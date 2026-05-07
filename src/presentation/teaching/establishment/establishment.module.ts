import { Module } from '@nestjs/common';

import { EstablishmentController } from './establishment.controller';
import { GetEstablishmentsStatsUseCase } from '../../../application/establishment/get-establishment-stats.use-case';
import { AuthPersistenceModule } from '../../../infrastructure/supabase/auth/auth-persistence.module';
import { EstablishmentPersistenceModule } from '../../../infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { StudentPersistenceModule } from '../../../infrastructure/supabase/teaching/modules/student-persistence.module';
import { TeacherPersistenceModule } from '../../../infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { CreateEstablishmentUseCase } from '../../../application/establishment/create-establishment.use-case';

@Module({
  imports: [
    AuthPersistenceModule,
    EstablishmentPersistenceModule,
    StudentPersistenceModule,
    TeacherPersistenceModule,
  ],
  controllers: [EstablishmentController],
  providers: [GetEstablishmentsStatsUseCase, CreateEstablishmentUseCase],
})
export class EstablishmentModule {}
