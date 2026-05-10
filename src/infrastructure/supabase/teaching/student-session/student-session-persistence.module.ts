import { Module } from '@nestjs/common';
import { STUDENT_SESSION_REPOSITORY } from 'src/domain/teaching/interfaces/i-student-session.repository';
import { SupabaseModule } from '../../supabase.module';
import { StudentSessionRepository } from './repositories/student-session.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: STUDENT_SESSION_REPOSITORY,
      useClass: StudentSessionRepository,
    },
  ],
  exports: [STUDENT_SESSION_REPOSITORY],
})
export class StudentSessionPersistenceModule {}
