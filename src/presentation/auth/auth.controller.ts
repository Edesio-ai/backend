import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { GenerateCsrfTokenUseCase } from '../../application/auth/generate-csrf-token.use-case';
import { GetUserSessionUseCase } from '../../application/auth/get-user-session.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import {
  AuthUser,
  GetUserSessionResponse,
} from '../../domain/auth/types/auth.type';
import { RegisterBody } from './dto/register-body.dto';
import { LoginBodyDto } from './dto/login-body.dto';
import { Public } from './decorator/public.decorator';
import { SkipCsrf } from './decorator/skip-csrf.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getUserSessionUseCase: GetUserSessionUseCase,
    private readonly generateCsrfTokenUseCase: GenerateCsrfTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

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
    const role = user.metadata.role;
    return { user, role };
  }

  @Public()
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

  @Public()
  @SkipCsrf()
  @Post('register')
  async register(@Body() body: RegisterBody): Promise<void> {
    await this.registerUseCase.execute(body);
    return;
  }
  @Public()
  @SkipCsrf()
  @Post('login')
  async login(
    @Body() body: LoginBodyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    const isProd = process.env.NODE_ENV === 'production';
    const { authUser, session } = await this.loginUseCase.execute(body);

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: session.expiresIn * 1000,
    };

    res.cookie('access_token', session.accessToken, cookieOptions);
    res.cookie('refresh_token', session.refreshToken, cookieOptions);

    return authUser;
  }

  @Public()
  @Post('logout')
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
