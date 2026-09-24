import { ArgumentMetadata, Injectable, PipeTransform, ValidationPipe } from '@nestjs/common';

import { RegisterBody } from '../dto/register-body.dto';
import { RegisterEstablishmentBodyDto } from '../dto/estabishment-register.dto';

@Injectable()
export class RegisterBodyValidationPipe implements PipeTransform {
  private readonly validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  });

  transform(value: unknown, metadata: ArgumentMetadata) {
    const role = value && typeof value === 'object' ? (value as { role?: unknown }).role : undefined;
    const metatype = role === 'establishment' ? RegisterEstablishmentBodyDto : RegisterBody;

    return this.validationPipe.transform(value, {
      ...metadata,
      metatype,
    });
  }
}
