import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { Module } from '@nestjs/common';
import { CourseFileController } from './course-file.controller';
import { DeleteCourseFileUseCase } from 'src/application/teaching/course-file/delete-course-file.use-case';
import { UploadCourseFileUseCase } from 'src/application/teaching/course-file/upload-course-file.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { GetCourseFilesUseCase } from 'src/application/teaching/course-file/get-course-files.use-case';
import { GetCourseFileSignedUrlUseCase } from 'src/application/teaching/course-file/get-course-file-signed-url.use-case';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-persistence.repository';
import { StudentPersistenceModule } from 'src/infrastructure/supabase/teaching/student/student-persistence.module';
import { StudentSessionPersistenceModule } from 'src/infrastructure/supabase/teaching/student-session/student-session-persistence.module';

@Module({
  imports: [
    AuthPersistenceModule,
    CoursePersistenceModule,
    CourseFilePersistenceModule,
    StudentPersistenceModule,
    StudentSessionPersistenceModule,
  ],
  controllers: [CourseFileController],
  providers: [DeleteCourseFileUseCase, UploadCourseFileUseCase, GetCourseFilesUseCase, GetCourseFileSignedUrlUseCase],
})
export class CourseFileModule {}
