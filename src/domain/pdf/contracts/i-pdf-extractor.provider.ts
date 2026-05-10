import { Question } from 'src/domain/teaching/question/types/question.type';

export const PDF_EXTRACTOR = Symbol('PDF_EXTRACTOR');

export interface IPdfExtractorProvider {
  extractTextFromPdf(data: Buffer): Promise<string>;
  extractQuestionsToPdf(
    questions: Question[],
    sessionName: string,
    courseTitle: string,
  ): Promise<{ buffer: Buffer; fileName: string }>;
}
