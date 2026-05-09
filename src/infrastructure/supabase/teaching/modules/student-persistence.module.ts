import { Module } from '@nestjs/common';
import { StudentSupabaseRepository } from '../repositories/student-supabase.repository';
import { STUDENT_REPOSITORY } from 'src/domain/teaching/interfaces/student.repository';
import { SupabaseModule } from '../../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentSupabaseRepository,
    },
  ],
  exports: [STUDENT_REPOSITORY],
})
export class StudentPersistenceModule {}
