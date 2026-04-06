import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { AuthError } from '../../domain/auth/errors';

@Catch(AuthError)
export class AuthErrorFilter implements ExceptionFilter {
  catch(exception: AuthError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(exception.httpStatus).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
