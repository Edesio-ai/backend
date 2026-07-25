import { PdfParseExtractor } from './pdf-extractor.repository';
import { Question } from 'src/domain/teaching/question/types/question.type';

const mockGetText = jest.fn();
const mockDestroy = jest.fn();

jest.mock('pdf-parse', () => {
  return {
    PDFParse: jest.fn().mockImplementation(() => ({
      getText: mockGetText,
      destroy: mockDestroy,
    })),
  };
});

const mockSetFontSize = jest.fn();
const mockSetTextColor = jest.fn();
const mockText = jest.fn();
const mockAddPage = jest.fn();
const mockOutput = jest.fn();
const mockSplitTextToSize = jest.fn((text: string) => [text]);

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210 } },
    setFontSize: mockSetFontSize,
    setTextColor: mockSetTextColor,
    text: mockText,
    addPage: mockAddPage,
    splitTextToSize: mockSplitTextToSize,
    output: mockOutput,
  })),
}));

const BASE_QUESTION: Question = {
  id: 'q-1',
  courseId: 'course-1',
  type: 'single',
  questionText: 'Quelle est la capitale de la France ?',
  proposals: [
    { id: 'a', label: 'Paris' },
    { id: 'b', label: 'Lyon' },
    { id: 'c', label: 'Marseille' },
  ],
  correctAnswers: ['a'],
  explanation: 'Paris est la capitale.',
  createdAt: '2026-01-01T00:00:00.000Z',
  positionOrder: 1,
};

describe('PdfParseExtractor', () => {
  let extractor: PdfParseExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDestroy.mockResolvedValue(undefined);
    mockOutput.mockReturnValue(new ArrayBuffer(8));
    extractor = new PdfParseExtractor();
  });

  // ─── extractTextFromPdf ───────────────────────────────────────────────────

  describe('extractTextFromPdf', () => {
    it('should return extracted text from a PDF buffer', async () => {
      mockGetText.mockResolvedValue({ text: 'Contenu extrait du PDF' });

      const result = await extractor.extractTextFromPdf(Buffer.from('pdf'));

      expect(result).toBe('Contenu extrait du PDF');
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it('should return empty string when text is empty', async () => {
      mockGetText.mockResolvedValue({ text: '' });

      const result = await extractor.extractTextFromPdf(Buffer.from('pdf'));

      expect(result).toBe('');
    });

    it('should call destroy even when getText throws', async () => {
      mockGetText.mockRejectedValue(new Error('parse error'));

      await expect(extractor.extractTextFromPdf(Buffer.from('pdf'))).rejects.toThrow('parse error');

      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── extractQuestionsToPdf ────────────────────────────────────────────────

  describe('extractQuestionsToPdf', () => {
    it('should return a Buffer and a fileName', async () => {
      const { buffer, fileName } = extractor.extractQuestionsToPdf([BASE_QUESTION], 'Session A', 'Mathématiques');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(fileName).toMatch(/^questions_Math_matiques_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should include the session name and course title in the header', async () => {
      extractor.extractQuestionsToPdf([BASE_QUESTION], 'Session Test', 'Histoire');

      const allTextCalls = mockText.mock.calls.map((c) => c[0]);
      expect(allTextCalls).toContain('Session : Session Test');
      expect(allTextCalls).toContain('Questions - Histoire');
    });

    it('should write question count in the header', async () => {
      const questions = [BASE_QUESTION, { ...BASE_QUESTION, id: 'q-2' }];
      extractor.extractQuestionsToPdf(questions, 'S', 'C');

      const allTextCalls = mockText.mock.calls.map((c) => c[0]);
      expect(allTextCalls).toContain('2 question(s)');
    });

    it('should display "QCM" label for single-type questions', async () => {
      extractor.extractQuestionsToPdf([BASE_QUESTION], 'S', 'C');

      const allTextCalls = mockText.mock.calls.map((c) => c[0]);
      expect(allTextCalls.some((t) => typeof t === 'string' && t.includes('QCM'))).toBe(true);
    });

    it('should display "Choix multiples" label for multiple-type questions', async () => {
      const q: Question = {
        ...BASE_QUESTION,
        type: 'multiple',
        correctAnswers: ['a', 'b'],
      };
      extractor.extractQuestionsToPdf([q], 'S', 'C');

      const allTextCalls = mockText.mock.calls.map((c) => c[0]);
      expect(allTextCalls.some((t) => typeof t === 'string' && t.includes('Choix multiples'))).toBe(true);
    });

    it('should display "Question ouverte" label for open-type questions', async () => {
      const q: Question = {
        ...BASE_QUESTION,
        type: 'open',
        proposals: null,
        correctAnswers: ['Paris'],
      };
      extractor.extractQuestionsToPdf([q], 'S', 'C');

      const allTextCalls = mockText.mock.calls.map((c) => c[0]);
      expect(allTextCalls.some((t) => typeof t === 'string' && t.includes('Question ouverte'))).toBe(true);
    });

    it('should write the correct answer for a single-type question with object proposals', async () => {
      extractor.extractQuestionsToPdf([BASE_QUESTION], 'S', 'C');

      const allTextCalls = mockText.mock.calls.map((c) => c[0]);
      expect(allTextCalls.some((t) => typeof t === 'string' && t.includes('Réponse') && t.includes('Paris'))).toBe(
        true,
      );
    });

    it('should write the expected answer for an open-type question with plain string correctAnswers', async () => {
      const q: Question = {
        ...BASE_QUESTION,
        type: 'open',
        proposals: null,
        correctAnswers: ['La photosynthèse'],
        explanation: null,
      };
      extractor.extractQuestionsToPdf([q], 'S', 'C');

      // doc.text() may receive a string[] from splitTextToSize — flatten 2 levels
      const allTextCallsFlat = mockText.mock.calls.flat(2).filter((v) => typeof v === 'string');
      expect(allTextCallsFlat.some((t) => t.includes('Réponse attendue') && t.includes('La photosynthèse'))).toBe(true);
    });

    it('should write the explanation when present', async () => {
      extractor.extractQuestionsToPdf([BASE_QUESTION], 'S', 'C');

      // doc.text() may receive a string[] from splitTextToSize — flatten 2 levels
      const allTextCallsFlat = mockText.mock.calls.flat(2).filter((v) => typeof v === 'string');
      expect(allTextCallsFlat.some((t) => t.includes('Explication') && t.includes('Paris est la capitale.'))).toBe(
        true,
      );
    });

    it('should not write an explanation block when explanation is null', async () => {
      const q: Question = { ...BASE_QUESTION, explanation: null };
      extractor.extractQuestionsToPdf([q], 'S', 'C');

      const allTextCallsFlat = mockText.mock.calls.flat().filter((v) => typeof v === 'string');
      expect(allTextCallsFlat.some((t) => t.includes('Explication'))).toBe(false);
    });

    it('should add a new page when yPos exceeds 250', async () => {
      // splitTextToSize returns 60 lines per call → yPos grows fast and triggers addPage
      mockSplitTextToSize.mockImplementation((text: string) => Array(60).fill(text));

      const manyQuestions = Array.from({ length: 5 }, (_, i) => ({
        ...BASE_QUESTION,
        id: `q-${i}`,
      }));

      extractor.extractQuestionsToPdf(manyQuestions, 'S', 'C');

      expect(mockAddPage).toHaveBeenCalled();
    });

    it('should handle questions with plain string proposals', async () => {
      const q: Question = {
        ...BASE_QUESTION,
        proposals: ['Oui', 'Non'],
        correctAnswers: ['Oui'],
      };

      const { buffer } = extractor.extractQuestionsToPdf([q], 'S', 'C');

      expect(buffer).toBeInstanceOf(Buffer);
      const allTextCalls = mockText.mock.calls.map((c) => c[0]);
      expect(allTextCalls.some((t) => typeof t === 'string' && t.includes('Réponse') && t.includes('Oui'))).toBe(true);
    });

    it('should handle questions with null proposals gracefully', async () => {
      const q: Question = {
        ...BASE_QUESTION,
        type: 'open',
        proposals: null,
        correctAnswers: null,
        explanation: null,
      };

      expect(() => extractor.extractQuestionsToPdf([q], 'S', 'C')).not.toThrow();
    });

    it('should produce a non-empty buffer', async () => {
      mockOutput.mockReturnValue(new ArrayBuffer(16));

      const { buffer } = extractor.extractQuestionsToPdf([BASE_QUESTION], 'S', 'C');

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should sanitise special characters in the fileName', async () => {
      const { fileName } = extractor.extractQuestionsToPdf([BASE_QUESTION], 'S', 'Cours & Tests!');

      expect(fileName).not.toMatch(/[&! ]/);
      expect(fileName).toMatch(/^questions_Cours___Tests__\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });
});
