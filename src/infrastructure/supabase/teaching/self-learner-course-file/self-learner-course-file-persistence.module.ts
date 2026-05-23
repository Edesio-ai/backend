import { Module } from '@nestjs/common';
import { SELF_LEARNER_COURSE_FILE_REPOSITORY } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import { SupabaseModule } from '../../supabase.module';
import { SelfLearnerCourseFileRepository } from './repositories/self-learner-course-file.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SELF_LEARNER_COURSE_FILE_REPOSITORY,
      useClass: SelfLearnerCourseFileRepository,
    },
  ],
  exports: [SELF_LEARNER_COURSE_FILE_REPOSITORY],
})
export class SelfLearnerCourseFilePersistenceModule {}
