import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { GenerateCsrfTokenUseCase } from '../../application/auth/generate-csrf-token.use-case';
import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { GetUserSessionUseCase } from '../../application/auth/get-user-session.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { SignUpTeacherUseCase } from '../../application/auth/sign-up-teacher.use-case';
import { SendInvitationUseCase } from '../../application/auth/send-invitation.use-case';
import { InvitationTokenPreview } from '../../domain/auth/invitation.type';
import {
  AuthSession,
  GetUserSessionResponse,
} from '../../domain/auth/auth.type';
import { AuthErrorFilter } from '../filters/auth.filter';
import { EmailErrorFilter } from '../filters/email.filter';
import { Roles } from './decorator/role.decorator';
import { GetInvitationPreviewParamsDto } from './dto/get-invitation-preview.dto';
import { SignUpTeacherBody } from './dto/sign-up-teacher.dto';
import { RegisterBody } from './dto/register-body.dto';
import { LoginBodyDto } from './dto/login-body.dto';
import { SendInvitationBodyDto } from './dto/send-invitation-body.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { RolesGuard } from './guards/roles.guard';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import { CreateInvitationTokenBodyDto } from './dto/create-invitation-token.dto';
import { CreateInvitationTokenUseCase } from '../../application/auth/create-invitation-toke.use-case';

@Controller('auth')
@UseFilters(AuthErrorFilter, EmailErrorFilter)
export class AuthController {
  constructor(
    private readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase,
    private readonly signUpTeacherUseCase: SignUpTeacherUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly sendInvitationUseCase: SendInvitationUseCase,
    private readonly getUserSessionUseCase: GetUserSessionUseCase,
    private readonly generateCsrfTokenUseCase: GenerateCsrfTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly createInvitationTokenUseCase: CreateInvitationTokenUseCase,
  ) {}

  @Get('invitation-preview/:token')
  async getInvitationPreview(
    @Param() params: GetInvitationPreviewParamsDto,
  ): Promise<InvitationTokenPreview> {
    const invitationTokenPreview =
      await this.getInvitationPreviewUseCase.execute(params.token);
    return invitationTokenPreview;
  }

  @Get('session')
  async getUserSession(@Req() req: Request): Promise<GetUserSessionResponse> {
    const token = req.cookies?.access_token;
    if (!token) {
      return {
        user: null,
        role: null,
      };
    }
    const user = await this.getUserSessionUseCase.execute(token);
    const role = user.user_metadata.role;
    return { user, role };
  }

  @Get('csrf')
  getCsrf(@Res({ passthrough: true }) res: Response): { csrfToken: string } {
    const { csrfToken, maxAgeMs } = this.generateCsrfTokenUseCase.execute();
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    });

    return { csrfToken };
  }

  @UseGuards(CsrfGuard)
  @Post('sign-up/teacher')
  async signUpTeacher(
    @Body() body: SignUpTeacherBody,
  ): Promise<{ success: boolean }> {
    await this.signUpTeacherUseCase.execute(body);
    return { success: true };
  }

  @Post('register')
  async register(@Body() body: RegisterBody): Promise<void> {
    await this.registerUseCase.execute(body);
    return;
  }
  @Post('login')
  async login(
    @Body() body: LoginBodyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const isProd = process.env.NODE_ENV === 'production';
    const session = await this.loginUseCase.execute(body);

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: session.expires_in * 1000,
    };

    res.cookie('access_token', session.access_token, cookieOptions);
    res.cookie('refresh_token', session.refresh_token, cookieOptions);

    return session;
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('establishment')
  @Post('send-invitation')
  async sendInvitation(
    @Body() body: SendInvitationBodyDto,
  ): Promise<{ success: boolean }> {
    await this.sendInvitationUseCase.execute(body);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('establishment')
  @Post('invitation-token/create')
  async createInvitationToken(
    @Body() body: CreateInvitationTokenBodyDto,
  ): Promise<{ success: boolean }> {
    await this.createInvitationTokenUseCase.execute(body);
    return { success: true };
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      await this.logoutUseCase.execute(accessToken);
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.clearCookie('access_token', cookieOpts);
    res.clearCookie('refresh_token', cookieOpts);
    res.clearCookie('csrf_token', { ...cookieOpts, httpOnly: false });

    return { success: true };
  }
}
