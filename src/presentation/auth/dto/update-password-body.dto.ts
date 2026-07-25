import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordBodyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(12, { message: 'Password must contain at least 12 characters' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must contain a lowercase letter, an uppercase letter, a number and a special character',
  })
  password: string;
}
