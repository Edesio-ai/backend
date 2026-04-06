import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { EmailError } from '../../domain/email/errors';

@Catch(EmailError)
export class EmailErrorFilter implements ExceptionFilter {
  catch(exception: EmailError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(exception.httpStatus).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
