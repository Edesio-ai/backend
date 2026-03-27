import { Module } from '@nestjs/common';

import { EstablishmentController } from './establishment.controller';
import { GetEstablishmentsStatsUseCase } from '../../application/establishment/get-establishment-stats.use-case';
import { authPersistenceModule } from '../../infrastructure/persistence/supabase/auth/auth-persistence.module';
import { establishmentPersistenceModule } from '../../infrastructure/persistence/supabase/establishment/establishment-persistence.module';
import { StudentPersistenceModule } from '../../infrastructure/persistence/supabase/student/student-persistence.module';
import { TeacherPersistenceModule } from '../../infrastructure/persistence/supabase/teacher/teacher-persistence.module';

@Module({
  imports: [
    authPersistenceModule,
    establishmentPersistenceModule,
    StudentPersistenceModule,
    TeacherPersistenceModule
  ],
  controllers: [EstablishmentController],
  providers: [
    GetEstablishmentsStatsUseCase,
  ],
})
export class EstablishmentModule {}