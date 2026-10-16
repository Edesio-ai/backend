import 'reflect-metadata';
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { RegisterBodyValidationPipe } from './register-body-validation.pipe';
import { RegisterBody } from '../dto/register-body.dto';
import { RegisterEstablishmentBodyDto } from '../dto/estabishment-register.dto';

describe('RegisterBodyValidationPipe', () => {
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: Object,
    data: undefined,
  };

  const validPassword = 'SecurePass12!Extra';

  let pipe: RegisterBodyValidationPipe;

  beforeEach(() => {
    pipe = new RegisterBodyValidationPipe();
  });

  it('validates establishment bodies against RegisterEstablishmentBodyDto', async () => {
    const body = {
      role: 'establishment',
      type: 'high_school',
      name: 'Lycée Victor Hugo',
      address: {
        street: '12 rue de la République',
        zipCode: '75001',
        city: 'Paris',
        country: 'FR',
      },
      contact: {
        firstname: 'Alex',
        lastname: 'Dupont',
        email: 'owner@school.com',
        password: validPassword,
        acceptTerms: true,
      },
    };

    const result = await pipe.transform(body, metadata);

    expect(result).toBeInstanceOf(RegisterEstablishmentBodyDto);
  });

  it('rejects establishment bodies with empty address fields', async () => {
    const body = {
      role: 'establishment',
      type: 'high_school',
      name: 'Lycée Victor Hugo',
      address: {
        street: '',
        zipCode: '',
        city: '',
        country: '',
      },
      contact: {
        firstname: 'Alex',
        lastname: 'Dupont',
        email: 'owner@school.com',
        password: validPassword,
        acceptTerms: true,
      },
    };

    await expect(pipe.transform(body, metadata)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects establishment bodies with unsupported country', async () => {
    const body = {
      role: 'establishment',
      type: 'high_school',
      name: 'Lycée Victor Hugo',
      address: {
        street: '12 rue de la République',
        zipCode: '75001',
        city: 'Paris',
        country: 'JP',
      },
      contact: {
        firstname: 'Alex',
        lastname: 'Dupont',
        email: 'owner@school.com',
        password: validPassword,
        acceptTerms: true,
      },
    };

    await expect(pipe.transform(body, metadata)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates non-establishment bodies against RegisterBody', async () => {
    const body = {
      role: 'student',
      email: 'user@school.com',
      password: validPassword,
      firstname: 'Alex',
      lastname: 'Dupont',
      acceptTerms: true,
    };

    const result = await pipe.transform(body, metadata);

    expect(result).toBeInstanceOf(RegisterBody);
  });
});
