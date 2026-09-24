import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { GenerateCsrfTokenUseCase } from '../../application/auth/generate-csrf-token.use-case';
import { GetUserSessionUseCase } from '../../application/auth/get-user-session.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { RegisterUseCase } from '../../application/auth/register.use-case';
import { LogoutUseCase } from '../../application/auth/logout.use-case';
import { AuthTokenData, AuthUser, GetUserSessionResponse, Role, type User } from '../../domain/auth/types/auth.type';
import { RegisterBody } from './dto/register-body.dto';
import { LoginBodyDto } from './dto/login-body.dto';
import { Public } from './decorator/public.decorator';
import { SkipCsrf } from './decorator/skip-csrf.decorator';
import { ResetPasswordBodyDto } from './dto/reset-password-body.dto';
import { ResetPasswordUseCase } from 'src/application/auth/reset-password.use-case';
import { UpdatePasswordBodyDto } from './dto/update-password-body.dto';
import { UpdatePasswordUseCase } from 'src/application/auth/update-password.use-case';
import { CurrentUser } from './decorator/current-user.decorator';
import { RegisterEstablishmentBodyDto } from './dto/estabishment-register.dto';
import { RegisterBodyValidationPipe } from './pipes/register-body-validation.pipe';
import { EstablishmentWithContact } from 'src/domain/teaching/establishment/types/establishment.type';

/** Keep refresh cookie longer than access JWT so /auth/session can renew. */
const REFRESH_TOKEN_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getUserSessionUseCase: GetUserSessionUseCase,
    private readonly generateCsrfTokenUseCase: GenerateCsrfTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  @Public()
  @Get('session')
  async getUserSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GetUserSessionResponse> {
    const accessToken = req.cookies?.access_token ?? req.headers?.authorization?.split(' ')[1];
    const refreshToken = req.cookies?.refresh_token;

    const { user, refreshedSession } = await this.getUserSessionUseCase.execute(accessToken, refreshToken);

    if (refreshedSession) {
      this.setAuthCookies(res, refreshedSession);
    }

    if (!user && (accessToken || refreshToken)) {
      this.clearAuthCookies(res);
    }

    const role = (user?.metadata.role as Role | undefined) ?? null;
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
  async register(
    @Body(RegisterBodyValidationPipe) body: RegisterBody | RegisterEstablishmentBodyDto,
  ): Promise<EstablishmentWithContact | void> {
    return this.registerUseCase.execute(body);
  }

  @Public()
  @SkipCsrf()
  @Post('login')
  async login(@Body() body: LoginBodyDto, @Res({ passthrough: true }) res: Response): Promise<AuthUser> {
    const { authUser, session } = await this.loginUseCase.execute(body);
    this.setAuthCookies(res, session);
    return authUser;
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      await this.logoutUseCase.execute(accessToken);
    }

    this.clearAuthCookies(res);
    return { success: true };
  }

  @Public()
  @SkipCsrf()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordBodyDto): Promise<void> {
    await this.resetPasswordUseCase.execute(body.email);
    return;
  }

  @SkipCsrf()
  @Post('update-password')
  async changePassword(@Body() body: UpdatePasswordBodyDto, @CurrentUser() user: User): Promise<void> {
    await this.updatePasswordUseCase.execute(user.id, body.password);
    return;
  }

  private setAuthCookies(res: Response, session: AuthTokenData): void {
    const isProd = process.env.NODE_ENV === 'production';
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('access_token', session.accessToken, {
      ...base,
      maxAge: session.expiresIn * 1000,
    });
    res.cookie('refresh_token', session.refreshToken, {
      ...base,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }

  private clearAuthCookies(res: Response): void {
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
  }
}
