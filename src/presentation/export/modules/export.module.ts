import { Module } from '@nestjs/common';
import { ExportController } from '../controllers/export.controller';
import { ExportQuestionsUseCase } from 'src/application/export/export-questions.use-case';
import { PdfModule } from 'src/infrastructure/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [ExportController],
  providers: [ExportQuestionsUseCase],
})
export class ExportModule {}
