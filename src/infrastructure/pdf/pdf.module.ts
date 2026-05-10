import { Module } from '@nestjs/common';
import { PDF_EXTRACTOR } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { PdfParseExtractor } from './pdf-extractor.repository';

@Module({
  providers: [
    {
      provide: PDF_EXTRACTOR,
      useClass: PdfParseExtractor,
    },
  ],
  exports: [PDF_EXTRACTOR],
})
export class PdfModule {}
