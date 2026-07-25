import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { Module } from '@nestjs/common';
import { CourseFileController } from './course-file.controller';
import { DeleteCourseFileUseCase } from 'src/application/teaching/course-file/delete-course-file.use-case';
import { UploadCourseFileUseCase } from 'src/application/teaching/course-file/upload-course-file.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { GetCourseFilesUseCase } from 'src/application/teaching/course-file/get-course-files.use-case';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';

@Module({
  imports: [AuthPersistenceModule, CoursePersistenceModule, CourseFilePersistenceModule],
  controllers: [CourseFileController],
  providers: [DeleteCourseFileUseCase, UploadCourseFileUseCase, GetCourseFilesUseCase],
})
export class CourseFileModule {}
