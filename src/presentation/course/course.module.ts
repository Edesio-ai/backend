import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CoursePersistenceModule } from 'src/infrastructure/persistence/supabase/course/course-persistence.module';
import { CreateCourseUseCase } from 'src/application/course/create-course.use-case';
import { UploadCourseFileUseCase } from 'src/application/course/upload-course-file.use-case';
import { AuthPersistenceModule } from 'src/infrastructure/persistence/supabase/auth/auth-persistence.module';

@Module({
  imports: [CoursePersistenceModule, AuthPersistenceModule],
  controllers: [CourseController],
  providers: [CreateCourseUseCase, UploadCourseFileUseCase],
})
export class CourseModule {}
