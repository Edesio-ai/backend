import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { OpenAiError } from 'src/domain/shared/llm/errors/open-ai.error';

@Catch(OpenAiError)
export class OpenAiErrorFilter implements ExceptionFilter {
  catch(exception: OpenAiError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    res.status(exception.httpStatus).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
