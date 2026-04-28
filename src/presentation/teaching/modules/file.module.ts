import { FilePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/file-persistence.module';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { Module } from '@nestjs/common';
import { FileController } from '../controllers/file.controller';
import { DeleteCourseFileUseCase } from 'src/application/course/delete-course-file.use-case';

@Module({
  imports: [FilePersistenceModule, AuthPersistenceModule],
  controllers: [FileController],
  providers: [DeleteCourseFileUseCase],
})
export class FileModule {}
