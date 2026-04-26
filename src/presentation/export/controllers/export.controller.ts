import { Post, Body, Controller, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ExportQuestionsDto } from '../dtos/exportQuestions.dto';
import { ExportQuestionsUseCase } from 'src/application/export/export-questions.use-case';

@Controller('export')
export class ExportController {
  constructor(
    private readonly exportQuestionsUseCase: ExportQuestionsUseCase,
  ) {}

  @Post('questions')
  async exportQuestions(
    @Body() body: ExportQuestionsDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } =
      await this.exportQuestionsUseCase.execute(body);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(HttpStatus.OK).send(buffer);
  }
}
