import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';

import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { InvitationTokenPreview } from '../../domain/auth/invitation.type';
import { GetInvitationPreviewParamsDto } from './dto/get-invitation-preview.dto';
import { SignUpTeacherBody } from './dto/sign-up-teacher.dto';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';
import { AuthErrorFilter } from '../filters/auth.filter';
import { RegisterBody } from './dto/register-body.dto';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { EmailErrorFilter } from '../filters/email.filter';

@Controller('auth')
@UseFilters(AuthErrorFilter, EmailErrorFilter)
export class AuthController {
  constructor(
    private readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase,
    private readonly signUpTeacherUseCase: SignUpTeacherUseCase,
    private readonly registerUseCase: RegisterUseCase
  ) { }

  @Get('invitation-preview/:token')
  async getInvitationPreview(@Param() params: GetInvitationPreviewParamsDto): Promise<InvitationTokenPreview> {
    const invitationTokenPreview = await this.getInvitationPreviewUseCase.execute(params.token);
    return invitationTokenPreview;
  }

  @Post('sign-up/teacher')
  async signUpTeacher(@Body() body: SignUpTeacherBody): Promise<void> {
    await this.signUpTeacherUseCase.execute(body);
    return;
  }

  @Post('register')
  async register(@Body() body: RegisterBody): Promise<void> {
    await this.registerUseCase.execute(body);
    return;
  }
}
