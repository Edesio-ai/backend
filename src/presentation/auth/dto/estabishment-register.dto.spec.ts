import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterEstablishmentBodyDto } from './estabishment-register.dto';

describe('RegisterEstablishmentBodyDto', () => {
  const validPassword = 'SecurePass12!Extra';

  const validPayload = () => ({
    role: 'establishment' as const,
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
  });

  const valid = () => plainToInstance(RegisterEstablishmentBodyDto, validPayload());

  it('accepts a valid establishment registration body', async () => {
    expect(await validate(valid())).toHaveLength(0);
  });

  it('rejects missing address', async () => {
    const { address: _address, ...withoutAddress } = validPayload();
    const dto = plainToInstance(RegisterEstablishmentBodyDto, withoutAddress);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'address')).toBe(true);
  });

  it('rejects empty address fields', async () => {
    const dto = plainToInstance(RegisterEstablishmentBodyDto, {
      ...validPayload(),
      address: {
        street: '',
        zipCode: '',
        city: '',
        country: '',
      },
    });

    const errors = await validate(dto);
    const addressError = errors.find((e) => e.property === 'address');

    expect(addressError?.children?.some((c) => c.property === 'street')).toBe(true);
    expect(addressError?.children?.some((c) => c.property === 'zipCode')).toBe(true);
    expect(addressError?.children?.some((c) => c.property === 'city')).toBe(true);
    expect(addressError?.children?.some((c) => c.property === 'country')).toBe(true);
  });

  it('rejects missing contact', async () => {
    const { contact: _contact, ...withoutContact } = validPayload();
    const dto = plainToInstance(RegisterEstablishmentBodyDto, withoutContact);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'contact')).toBe(true);
  });

  it('rejects unsupported country codes', async () => {
    const dto = plainToInstance(RegisterEstablishmentBodyDto, {
      ...validPayload(),
      address: {
        ...validPayload().address,
        country: 'JP',
      },
    });

    const errors = await validate(dto);
    const addressError = errors.find((e) => e.property === 'address');

    expect(addressError?.children?.some((c) => c.property === 'country')).toBe(true);
  });

  it('rejects unsupported establishment type', async () => {
    const dto = plainToInstance(RegisterEstablishmentBodyDto, {
      ...validPayload(),
      type: 'unknown_type',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });
});
