import { FilePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/file-persistence.module';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { DeleteCourseFileUseCase } from 'src/application/course/delete-course-file.use-case';
import { UploadCourseFileUseCase } from 'src/application/course/upload-course-file.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/course-persistence.module';
import { GetCourseFilesUseCase } from 'src/application/course/get-course-files.use-case';

@Module({
  imports: [
    FilePersistenceModule,
    AuthPersistenceModule,
    CoursePersistenceModule,
  ],
  controllers: [FileController],
  providers: [
    DeleteCourseFileUseCase,
    UploadCourseFileUseCase,
    GetCourseFilesUseCase,
  ],
})
export class FileModule {}
