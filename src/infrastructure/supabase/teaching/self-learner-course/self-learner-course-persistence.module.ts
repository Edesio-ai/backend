import { Module } from '@nestjs/common';
import { SELF_LEARNER_COURSE_REPOSITORY } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import { SupabaseModule } from '../../supabase.module';
import { SelfLearnerCourseRepository } from './repositories/self-learner-course.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SELF_LEARNER_COURSE_REPOSITORY,
      useClass: SelfLearnerCourseRepository,
    },
  ],
  exports: [SELF_LEARNER_COURSE_REPOSITORY],
})
export class SelfLearnerCoursePersistenceModule {}
