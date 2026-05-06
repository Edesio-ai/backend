import {
  Controller,
  Delete,
  Param,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DeleteCourseFileUseCase } from 'src/application/course/delete-course-file.use-case';
import { JwtAuthGuard } from 'src/presentation/auth/guards/jwt-auth.guard';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { RolesGuard } from 'src/presentation/auth/guards/roles.guard';
import { CsrfGuard } from 'src/presentation/auth/guards/csrf.guard';
import { GlobalErrorFilter } from 'src/presentation/filters/global';

@UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
@Roles('teacher')
@Controller('file')
export class FileController {
  constructor(
    private readonly deleteCourseFileUseCase: DeleteCourseFileUseCase,
  ) {}

  @UseFilters(GlobalErrorFilter)
  @Delete(':fileId')
  async deleteCourseFile(
    @Param('fileId') fileId: string,
  ): Promise<{ success: boolean }> {
    await this.deleteCourseFileUseCase.execute(fileId);
    return { success: true };
  }
}
