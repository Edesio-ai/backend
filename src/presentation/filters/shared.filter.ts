import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { GlobalError } from 'src/domain/shared/errors/global.errors';

@Catch(GlobalError)
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: GlobalError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(exception.httpStatus).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
