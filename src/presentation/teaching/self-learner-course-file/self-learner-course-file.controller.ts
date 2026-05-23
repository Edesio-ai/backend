import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import { CourseFileUpload } from 'src/domain/teaching/course-file/types/course-file.type';
import { UploadSelfLearnerCourseFileUseCase } from 'src/application/teaching/self-learner-course-file/upload-self-learner-course-file.use-case';
import { SelfLearnerCourseFile } from 'src/domain/teaching/self-learner-course-file/types/self-learner-course-file.type';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { type AuthUser } from 'src/domain/auth/types/auth.type';
import { GetSelfLearnerCourseFilesUseCase } from 'src/application/teaching/self-learner-course-file/get-self-learner-course-files.use-case';
import { DeleteSelfLearnerCourseFileUseCase } from 'src/application/teaching/self-learner-course-file/delete-self-learner-course-file.use-case';

@Roles('self-learner')
@Controller('self-learner-course-file')
export class SelfLearnerCourseFileController {
  constructor(
    private readonly uploadSelfLearnerCourseFileUseCase: UploadSelfLearnerCourseFileUseCase,
    private readonly getSelfLearnerCourseFilesUseCase: GetSelfLearnerCourseFilesUseCase,
    private readonly deleteSelfLearnerCourseFileUseCase: DeleteSelfLearnerCourseFileUseCase,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('self-learner-course/:courseId')
  async uploadSelfLearnerCourseFile(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ data: SelfLearnerCourseFile }> {
    if (!file?.buffer) {
      throw new BadRequestError('Missing File');
    }

    const payload: CourseFileUpload = {
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      byteLength: file.size,
    };

    const data = await this.uploadSelfLearnerCourseFileUseCase.execute(
      courseId,
      payload,
    );

    return { data };
  }

  @Get('self-learner-course/:courseId')
  async getSelfLearnerCourseFiles(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
  ): Promise<SelfLearnerCourseFile[]> {
    return await this.getSelfLearnerCourseFilesUseCase.execute(
      user.id,
      courseId,
    );
  }

  @Delete('/:fileId')
  async deleteSelfLearnerCourseFile(
    @CurrentUser() user: AuthUser,
    @Param('fileId') fileId: string,
  ): Promise<void> {
    return await this.deleteSelfLearnerCourseFileUseCase.execute(
      user.id,
      fileId,
    );
  }
}
