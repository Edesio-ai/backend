import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEstablishmentBodyDto {
  @IsString()
  @IsNotEmpty()
  supabaseUserId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}