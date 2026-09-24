import { Module } from '@nestjs/common';

import { EstablishmentController } from './establishment.controller';
import { GetEstablishmentsStatsUseCase } from 'src/application/teaching/establishment/get-establishment-stats.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { EstablishmentPersistenceModule } from 'src/infrastructure/supabase/teaching/establishment/establishment-persistence.module';
import { TeacherPersistenceModule } from 'src/infrastructure/supabase/teaching/teacher/teacher-persistence.module';
import { StudentSessionPersistenceModule } from 'src/infrastructure/supabase/teaching/student-session/student-session-persistence.module';
import { SessionsPersistenceModule } from 'src/infrastructure/supabase/teaching/session/sessions-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    EstablishmentPersistenceModule,
    TeacherPersistenceModule,
    StudentSessionPersistenceModule,
    SessionsPersistenceModule,
  ],
  controllers: [EstablishmentController],
  providers: [GetEstablishmentsStatsUseCase],
})
export class EstablishmentModule {}
