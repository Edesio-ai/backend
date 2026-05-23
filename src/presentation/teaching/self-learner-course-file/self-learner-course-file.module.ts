import { Module } from '@nestjs/common';
import { UploadSelfLearnerCourseFileUseCase } from 'src/application/teaching/self-learner-course-file/upload-self-learner-course-file.use-case';
import { SelfLearnerCourseFileController } from './self-learner-course-file.controller';
import { SelfLearnerCourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course-file/self-learner-course-file-persistence.module';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';
import { SelfLearnerCoursePersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner-course/self-learner-course-persistence.module';
import { GetSelfLearnerCourseFilesUseCase } from 'src/application/teaching/self-learner-course-file/get-self-learer-course-file.use-case';
import { SelfLearnerPersistenceModule } from 'src/infrastructure/supabase/teaching/self-learner/self-learner-persistence.module';

@Module({
  imports: [
    SelfLearnerCourseFilePersistenceModule,
    CourseFilePersistenceModule,
    SelfLearnerCoursePersistenceModule,
    SelfLearnerPersistenceModule,
  ],
  controllers: [SelfLearnerCourseFileController],
  providers: [
    UploadSelfLearnerCourseFileUseCase,
    GetSelfLearnerCourseFilesUseCase,
  ],
})
export class SelfLearnerCourseFileModule {}
