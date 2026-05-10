import {
  ExportQuestionsUseCase,
  ExportQuestionsBody,
} from './export-questions.use-case';
import { IPdfExtractorProvider } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { Question } from 'src/domain/teaching/question/types/question.type';

const SAMPLE_QUESTION: Question = {
  id: 'q-1',
  courseId: 'course-1',
  type: 'single',
  questionText: 'Quelle est la capitale de la France ?',
  proposals: [
    { id: 'a', label: 'Paris' },
    { id: 'b', label: 'Lyon' },
  ],
  correctAnswers: ['a'],
  explanation: 'Paris est la capitale.',
  createdAt: '2026-01-01T00:00:00.000Z',
  positionOrder: 1,
};

describe('ExportQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should call pdfExtractor.extractQuestionsToPdf with the correct arguments', async () => {
    fixtures.givenExtractorSucceeds();

    await fixtures.whenExecute();

    expect(fixtures.pdfExtractor.extractQuestionsToPdf).toHaveBeenCalledWith(
      fixtures.body.questions,
      fixtures.body.sessionName,
      fixtures.body.courseTitle,
    );
  });

  it('should return the buffer and fileName provided by the extractor', async () => {
    fixtures.givenExtractorSucceeds();

    const result = await fixtures.whenExecute();

    expect(result).toEqual({
      buffer: fixtures.fakeBuffer,
      fileName: fixtures.fakeFileName,
    });
  });

  it('should propagate errors thrown by the extractor', async () => {
    fixtures.givenExtractorFails();

    await expect(fixtures.whenExecute()).rejects.toBe(fixtures.extractorError);
  });

  it('should work with an empty questions array', async () => {
    fixtures.givenExtractorSucceeds();
    fixtures.body = { ...fixtures.body, questions: [] };

    const result = await fixtures.whenExecute();

    expect(fixtures.pdfExtractor.extractQuestionsToPdf).toHaveBeenCalledWith(
      [],
      fixtures.body.sessionName,
      fixtures.body.courseTitle,
    );
    expect(result.buffer).toBe(fixtures.fakeBuffer);
  });
});

class Fixtures {
  public body: ExportQuestionsBody = {
    questions: [SAMPLE_QUESTION],
    courseTitle: 'Mathématiques',
    sessionName: 'Session A',
  };

  public readonly fakeBuffer = Buffer.from('fake-pdf');
  public readonly fakeFileName = 'questions_Math_matiques_2026-01-01.pdf';
  public readonly extractorError = new Error('extractor error');

  public readonly pdfExtractor: jest.Mocked<IPdfExtractorProvider> = {
    extractTextFromPdf: jest.fn(),
    extractQuestionsToPdf: jest.fn(),
  };

  public readonly useCase = new ExportQuestionsUseCase(this.pdfExtractor);

  whenExecute() {
    return this.useCase.execute(this.body);
  }

  givenExtractorSucceeds() {
    this.pdfExtractor.extractQuestionsToPdf.mockResolvedValue({
      buffer: this.fakeBuffer,
      fileName: this.fakeFileName,
    });
  }

  givenExtractorFails() {
    this.pdfExtractor.extractQuestionsToPdf.mockRejectedValue(
      this.extractorError,
    );
  }
}
