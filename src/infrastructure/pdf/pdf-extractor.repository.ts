import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { type IPdfExtractorProvider } from 'src/domain/pdf/contracts/i-pdf-extractor.provider';
import { Question } from 'src/domain/teaching/question/types/question.type';
import { jsPDF } from 'jspdf';

@Injectable()
export class PdfParseExtractor implements IPdfExtractorProvider {
  async extractTextFromPdf(data: Buffer): Promise<string> {
    const parser = new PDFParse({ data });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  extractQuestionsToPdf(
    questions: Question[],
    sessionName: string,
    courseTitle: string,
  ): { buffer: Buffer; fileName: string } {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Edesio', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Session : ${sessionName}`, 14, 28);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Questions - ${courseTitle}`, 14, 40);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 14, 48);
    doc.text(`${questions.length} question(s)`, 14, 54);

    let yPos = 65;

    questions.forEach((q, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const typeLabel = q.type === 'single' ? 'QCM' : q.type === 'multiple' ? 'Choix multiples' : 'Question ouverte';

      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246);
      doc.text(`Question ${index + 1} (${typeLabel})`, 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setTextColor(0);

      const questionLines = doc.splitTextToSize(q.questionText, pageWidth - 28);
      doc.text(questionLines, 14, yPos);
      yPos += questionLines.length * 5 + 3;

      if (q.type === 'single' || q.type === 'multiple') {
        const labels = this.getPropositionLabels(q.proposals);
        if (labels.length > 0) {
          doc.setTextColor(60);
          labels.forEach((prop, i) => {
            const letter = String.fromCharCode(65 + i);
            const propText = `${letter}. ${prop}`;
            const propLines = doc.splitTextToSize(propText, pageWidth - 35);
            doc.text(propLines, 20, yPos);
            yPos += propLines.length * 5;
          });
          yPos += 2;
        }

        doc.setTextColor(34, 139, 34);
        if (q.type === 'single' && q.correctAnswers?.[0]) {
          doc.text(`Réponse : ${this.getCorrectAnswerDisplay(q.proposals, q.correctAnswers || [])}`, 14, yPos);
          yPos += 6;
        } else if (q.type === 'multiple' && q.correctAnswers && q.correctAnswers.length > 0) {
          const resolved = q.correctAnswers.map((ca) => this.getCorrectAnswerDisplay(q.proposals, [ca]));
          doc.text(`Réponses : ${resolved.join(', ')}`, 14, yPos);
          yPos += 6;
        }
      } else if (q.type === 'open') {
        doc.setTextColor(34, 139, 34);
        const openDisplay = this.getCorrectAnswerDisplay(q.proposals, q.correctAnswers || []);
        if (openDisplay) {
          const repLines = doc.splitTextToSize(`Réponse attendue : ${openDisplay}`, pageWidth - 28);
          doc.text(repLines, 14, yPos);
          yPos += repLines.length * 5 + 2;
        }
      }

      if (q.explanation) {
        doc.setTextColor(100);
        const expLines = doc.splitTextToSize(`Explication : ${q.explanation}`, pageWidth - 28);
        doc.text(expLines, 14, yPos);
        yPos += expLines.length * 5;
      }

      yPos += 8;
    });

    const fileName = `questions_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    const arrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(arrayBuffer);
    return { buffer, fileName };
  }

  private getPropositionLabels(proposals: unknown): string[] {
    if (proposals == null || !Array.isArray(proposals)) return [];
    return proposals
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'label' in item) {
          return String(item.label ?? '');
        }
        return '';
      })
      .filter((s) => s.length > 0);
  }

  private getCorrectAnswerDisplay(proposals: unknown, correctAnswers: string[] | null): string {
    if (correctAnswers == null) return '';

    if (!Array.isArray(proposals) || proposals.length === 0) {
      return correctAnswers.join(', ');
    }
    const first = proposals[0];
    if (typeof first === 'object' && first !== null && 'id' in first) {
      const row = proposals.find(
        (p): p is { id: string; label: string } =>
          typeof p === 'object' && p !== null && 'id' in p && (p as { id: string }).id === correctAnswers[0],
      );
      if (row?.label) return row.label;
    }
    const labels = this.getPropositionLabels(proposals);
    if (labels.includes(correctAnswers[0])) return correctAnswers[0];
    return correctAnswers.join(', ');
  }
}
