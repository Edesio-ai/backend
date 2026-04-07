import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TokenError } from 'src/domain/token/token.error';

@Catch(TokenError)
export class TokenErrorFilter implements ExceptionFilter {
  catch(exception: TokenError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(exception.httpStatus).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
