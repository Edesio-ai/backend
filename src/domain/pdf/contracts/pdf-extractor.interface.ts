import { Question } from 'src/domain/teaching/types/question.type';

export const PDF_EXTRACTOR = Symbol('PDF_EXTRACTOR');

export interface PdfExtractor {
  extractTextFromPdf(data: Buffer): Promise<string>;
  extractQuestionsToPdf(
    questions: Question[],
    sessionName: string,
    courseTitle: string,
  ): Promise<{ buffer: Buffer; fileName: string }>;
}
