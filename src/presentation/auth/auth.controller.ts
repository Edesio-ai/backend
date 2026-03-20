import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';

import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { InvitationTokenPreview } from '../../domain/auth/invitation.type';
import { GetInvitationPreviewParamsDto } from './dto/get-invitation-preview.dto';
import { SignUpTeacherBody } from './dto/sign-up-teacher.dto';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';
import { AuthErrorFilter } from '../filters/auth.filter';

@Controller('auth')
@UseFilters(AuthErrorFilter)
export class AuthController {
  constructor(
    private readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase,
    private readonly signUpTeacherUseCase: SignUpTeacherUseCase
  ) {}

  @Get('invitation-preview/:token')
  async getInvitationPreview(@Param() params: GetInvitationPreviewParamsDto): Promise<InvitationTokenPreview> {
    const invitationTokenPreview = await this.getInvitationPreviewUseCase.execute(params.token);
    return invitationTokenPreview;
  }

  @Post('sign-up/teacher')
  async signUpTeacher( @Body() body: SignUpTeacherBody): Promise<void> {
    await this.signUpTeacherUseCase.execute(body);
    return;
  }
}
