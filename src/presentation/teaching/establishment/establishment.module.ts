import { Module } from '@nestjs/common';

import { EstablishmentController } from './establishment.controller';
import { GetEstablishmentsStatsUseCase } from 'src/application/teaching/establishment/get-establishment-stats.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/establishment-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/student-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { CreateEstablishmentUseCase } from 'src/application/teaching/establishment/create-establishment.use-case';

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
