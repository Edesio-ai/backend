import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportQuestionsUseCase } from 'src/application/export/export-questions.use-case';
import { PdfModule } from 'src/infrastructure/pdf/pdf.module';
import { AuthPersistenceModule } from 'src/infrastructure/supabase/auth/auth-persistence.module';
import { ExportCourseFileUseCase } from 'src/application/export/export-course-file.use-case';
import { CoursePersistenceModule } from 'src/infrastructure/supabase/teaching/course/course-persistence.module';
import { FilePersistenceModule } from 'src/infrastructure/supabase/teaching/modules/file-persistence.module';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-supabase.repository';

@Module({
  imports: [PdfModule, FilePersistenceModule, CourseFilePersistenceModule],
  controllers: [ExportController],
  providers: [ExportQuestionsUseCase, ExportCourseFileUseCase],
})
export class ExportModule {}
