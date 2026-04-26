import { Inject } from '@nestjs/common';
import {
  PDF_EXTRACTOR,
  type PdfExtractor,
} from 'src/domain/pdf/contracts/pdf-extractor.interface';
import { Question } from 'src/domain/teaching/types/question.type';

export type ExportQuestionsBody = {
  questions: Question[];
  courseTitle: string;
  sessionName: string;
};

export class ExportQuestionsUseCase {
  constructor(
    @Inject(PDF_EXTRACTOR)
    private readonly pdfExtractor: PdfExtractor,
  ) {}

  async execute(
    body: ExportQuestionsBody,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const { questions, courseTitle, sessionName } = body;
    return await this.pdfExtractor.extractQuestionsToPdf(
      questions,
      sessionName,
      courseTitle,
    );
  }
}
