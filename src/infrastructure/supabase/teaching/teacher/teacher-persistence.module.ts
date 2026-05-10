import { Module } from '@nestjs/common';
import { TEACHER_REPOSITORY } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { TeacherSupabaseRepository } from './repositories/teacher-supabase.repository';
import { SupabaseModule } from '../../supabase.module';
import { SupabaseAuthModule } from '../../supabase-auth.module';

@Module({
  imports: [SupabaseModule, SupabaseAuthModule],
  providers: [
    {
      provide: TEACHER_REPOSITORY,
      useClass: TeacherSupabaseRepository,
    },
  ],
  exports: [TEACHER_REPOSITORY],
})
export class TeacherPersistenceModule {}
