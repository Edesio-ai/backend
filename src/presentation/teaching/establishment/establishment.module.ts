import { Module } from '@nestjs/common';

import { EstablishmentController } from './establishment.controller';
import { GetEstablishmentsStatsUseCase } from 'src/application/teaching/establishment/get-establishment-stats.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/modules/teacher-persistence.module';
import { CreateEstablishmentUseCase } from 'src/application/teaching/establishment/create-establishment.use-case';
import { StudentSessionPersistenceModule } from 'src/infrastructure/supabase/teaching/student-session/student-session-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    EstablishmentPersistenceModule,
    TeacherPersistenceModule,
    StudentSessionPersistenceModule,
  ],
  controllers: [EstablishmentController],
  providers: [GetEstablishmentsStatsUseCase, CreateEstablishmentUseCase],
})
export class EstablishmentModule {}
