import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportQuestionsUseCase } from 'src/application/export/export-questions.use-case';
import { PdfModule } from 'src/infrastructure/pdf/pdf.module';
import { ExportCourseFileUseCase } from 'src/application/export/export-course-file.use-case';
import { CourseFilePersistenceModule } from 'src/infrastructure/supabase/teaching/course-file/course-file-supabase.repository';

@Module({
  imports: [PdfModule, CourseFilePersistenceModule],
  controllers: [ExportController],
  providers: [ExportQuestionsUseCase, ExportCourseFileUseCase],
})
export class ExportModule {}
