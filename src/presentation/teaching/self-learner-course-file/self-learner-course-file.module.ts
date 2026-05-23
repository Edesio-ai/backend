import { Module } from '@nestjs/common';
import { UploadSelfLearnerCourseFileUseCase } from 'src/application/teaching/self-learner-course-file/upload-self-learner-course-file.use-case';
import { SelfLearnerCourseFileController } from './self-learner-course-file.controller';
import { SelfLearnerCourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course-file/self-learner-course-file-persistence.module';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';

@Module({
  imports: [
    SelfLearnerCourseFilePersistenceModule,
    CourseFilePersistenceModule,
  ],
  controllers: [SelfLearnerCourseFileController],
  providers: [UploadSelfLearnerCourseFileUseCase],
})
export class SelfLearningCourseFileModule {}
