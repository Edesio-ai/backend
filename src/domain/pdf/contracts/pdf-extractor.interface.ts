export const PDF_EXTRACTOR = Symbol('PDF_EXTRACTOR');

export interface PdfExtractor {
  extractTextFromPdf(data: Buffer): Promise<string>;
}
