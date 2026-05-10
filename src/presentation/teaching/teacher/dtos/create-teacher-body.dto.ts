import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTeacherBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
