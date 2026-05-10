import { Inject } from '@nestjs/common';
import {
  PDF_EXTRACTOR,
  type IPdfExtractorProvider,
} from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { Question } from 'src/domain/teaching/question/types/question.type';

export type ExportQuestionsBody = {
  questions: Question[];
  courseTitle: string;
  sessionName: string;
};

export class ExportQuestionsUseCase {
  constructor(
    @Inject(PDF_EXTRACTOR)
    private readonly pdfExtractor: IPdfExtractorProvider,
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
