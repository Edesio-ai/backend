import {
  Post,
  Body,
  Controller,
  Res,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportQuestionsDto } from './dtos/exportQuestions.dto';
import { ExportQuestionsUseCase } from 'src/application/export/export-questions.use-case';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { ExportCourseFileUseCase } from 'src/application/export/export-course-file.use-case';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('teacher')
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportQuestionsUseCase: ExportQuestionsUseCase,
    private readonly exportCourseFileUseCase: ExportCourseFileUseCase,
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

  @Post('file/:fileId')
  async exportCourseFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } =
      await this.exportCourseFileUseCase.execute(fileId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(HttpStatus.OK).send(buffer);
  }
}
