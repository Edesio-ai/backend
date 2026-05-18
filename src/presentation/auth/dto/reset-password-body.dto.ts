import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordBodyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
