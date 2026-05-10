import { Module } from '@nestjs/common';
import { STUDENT_COURSE_STATS_REPOSITORY } from 'src/domain/teaching/interfaces/i-student-course-stats.repository';
import { SupabaseModule } from '../../supabase.module';
import { StudentCourseStatsSupabaseRepository } from './repositories/student-course-states-supabase.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: STUDENT_COURSE_STATS_REPOSITORY,
      useClass: StudentCourseStatsSupabaseRepository,
    },
  ],
  exports: [STUDENT_COURSE_STATS_REPOSITORY],
})
export class StudentCourseStatsPersistenceModule {}
