import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LOCALES, type Locale } from 'src/domain/shared/locale.type';

export class RegisterBody {
  @IsString()
  @IsNotEmpty()
  @IsIn(['teacher', 'student', 'self-learner'])
  role: 'teacher' | 'student' | 'self-learner';

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12, { message: 'Password must contain at least 12 characters' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must contain a lowercase letter, an uppercase letter, a number and a special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsBoolean()
  @Equals(true, { message: 'You must accept the terms and conditions' })
  acceptTerms: boolean;

  @IsString()
  @IsOptional()
  establishment?: string;

  @IsString()
  @IsOptional()
  invitationToken?: string;

  @IsOptional()
  @IsString()
  @IsIn([...LOCALES])
  locale?: Locale;
}
