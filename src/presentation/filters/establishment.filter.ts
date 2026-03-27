import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { EstablishmentError } from '../../domain/establishment/error';

@Catch(EstablishmentError)
export class EstablishmentErrorFilter implements ExceptionFilter {
  catch(exception: EstablishmentError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(exception.httpStatus).json({
      code: exception.code,
      message: exception.message,
    });
  }
}