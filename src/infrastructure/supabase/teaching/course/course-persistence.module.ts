import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase.module';
import { CourseSupabaseRepository } from './repositories/course-supabase.repository';
import { COURSE_REPOSITORY } from 'src/domain/teaching/course/contracts/i-course.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseSupabaseRepository,
    },
  ],
  exports: [COURSE_REPOSITORY],
})
export class CoursePersistenceModule {}
