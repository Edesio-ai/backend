import { Module } from '@nestjs/common';
import { TEACHER_REPOSITORY } from 'src/domain/teaching/interface/teacher.repository';
import { TeacherSupabaseRepository } from './teacher-supabase.repository';
import { SupabaseModule } from '../supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: TEACHER_REPOSITORY,
      useClass: TeacherSupabaseRepository,
    },
  ],
  exports: [TEACHER_REPOSITORY],
})
export class TeacherPersistenceModule {}
