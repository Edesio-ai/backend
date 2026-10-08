import { Body, Controller, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileBodyDto } from './dtos/update-profile-body.dto';
import { type AuthUser } from 'src/domain/auth/types/auth.type';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateProfileUseCase } from 'src/application/profile/update-profile.use-case';
import { UploadProfilePhotoUseCase } from 'src/application/profile/upload-profile-photo.use-case';
import { ProfilePhotoUpload } from 'src/domain/profile/types/profile.type';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadProfilePhotoUseCase: UploadProfilePhotoUseCase,
  ) {}

  @Patch()
  async updateProfile(@CurrentUser() user: AuthUser, @Body() body: UpdateProfileBodyDto): Promise<void> {
    await this.updateProfileUseCase.execute(user, body);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('photo')
  async uploadProfilePhoto(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ photoUrl: string }> {
    if (!file?.buffer) {
      throw new BadRequestError('Missing File');
    }

    const payload: ProfilePhotoUpload = {
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      byteLength: file.size,
    };

    const photoUrl = await this.uploadProfilePhotoUseCase.execute(user, payload);
    return { photoUrl };
  }
}
