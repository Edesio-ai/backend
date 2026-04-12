import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase.module';
import { CourseSupabaseRepository } from '../modules/course-persistance.repository';
import { COURSE_REPOSITORY } from 'src/domain/teaching/interface/course.repository';

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
