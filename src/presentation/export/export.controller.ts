import { Post, Body, Controller, Res, HttpStatus, Param } from '@nestjs/common';
import type { Response } from 'express';
import { ExportQuestionsDto } from './dtos/exportQuestions.dto';
import { ExportQuestionsUseCase } from 'src/application/export/export-questions.use-case';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { ExportCourseFileUseCase } from 'src/application/export/export-course-file.use-case';

@Roles('teacher')
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportQuestionsUseCase: ExportQuestionsUseCase,
    private readonly exportCourseFileUseCase: ExportCourseFileUseCase,
  ) {}

  @Post('questions')
  exportQuestions(@Body() body: ExportQuestionsDto, @Res() res: Response): void {
    const { buffer, fileName } = this.exportQuestionsUseCase.execute(body);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(HttpStatus.OK).send(buffer);
  }

  @Post('file/:fileId')
  async exportCourseFile(@Param('fileId') fileId: string, @Res() res: Response): Promise<void> {
    const { buffer, fileName } = await this.exportCourseFileUseCase.execute(fileId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(HttpStatus.OK).send(buffer);
  }
}
