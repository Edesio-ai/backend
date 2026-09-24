import { IsEmail, IsIn, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ESTABLISHMENT_TYPES,
  type EstablishmentType,
} from 'src/domain/teaching/establishment/types/establishment.type';
import { EstablishmentAddressDto } from 'src/presentation/auth/dto/estabishment-register.dto';

export class CreateEstablishmentBodyDto {
  @IsString()
  @IsNotEmpty()
  supabaseUserId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EstablishmentAddressDto)
  address: EstablishmentAddressDto;

  @IsString()
  @IsNotEmpty()
  @IsIn([...ESTABLISHMENT_TYPES])
  type: EstablishmentType;
}
