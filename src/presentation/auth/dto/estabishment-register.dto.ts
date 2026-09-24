import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LOCALES, type Locale } from 'src/domain/shared/locale.type';
import {
  ESTABLISHMENT_COUNTRIES,
  ESTABLISHMENT_TYPES,
  type EstablishmentCountry,
  type EstablishmentType,
} from 'src/domain/teaching/establishment/types/establishment.type';

export class RegisterEstablishmentContactDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must contain a lowercase letter, an uppercase letter, a number and a special character',
  })
  password: string;

  @IsBoolean()
  @Equals(true)
  acceptTerms: boolean;
}

export class EstablishmentAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([...ESTABLISHMENT_COUNTRIES])
  country: EstablishmentCountry;
}

export class RegisterEstablishmentBodyDto {
  @IsIn(['establishment'])
  role: 'establishment';

  @IsIn([...ESTABLISHMENT_TYPES])
  type: EstablishmentType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EstablishmentAddressDto)
  address: EstablishmentAddressDto;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RegisterEstablishmentContactDto)
  contact: RegisterEstablishmentContactDto;

  @IsOptional()
  @IsIn([...LOCALES])
  locale?: Locale;
}
