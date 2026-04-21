import { PdfParseExtractor } from './pdf-extractor.repository';

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

describe('PdfParseExtractor', () => {
  let extractor: PdfParseExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDestroy.mockResolvedValue(undefined);
    extractor = new PdfParseExtractor();
  });

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

    await expect(
      extractor.extractTextFromPdf(Buffer.from('pdf')),
    ).rejects.toThrow('parse error');

    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });
});
