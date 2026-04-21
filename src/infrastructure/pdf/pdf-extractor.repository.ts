import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { type PdfExtractor } from 'src/domain/pdf/contracts/pdf-extractor.interface';

@Injectable()
export class PdfParseExtractor implements PdfExtractor {
  async extractTextFromPdf(data: Buffer): Promise<string> {
    const parser = new PDFParse({ data });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }
}
