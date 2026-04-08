import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { TeachingError } from 'src/domain/teaching/error';

export class TeacherErrorFilter implements ExceptionFilter {
  catch(exception: TeachingError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(exception.httpStatus).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
