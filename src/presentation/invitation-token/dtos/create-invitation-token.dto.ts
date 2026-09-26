import { IsDate, IsEmail, IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LOCALES, type Locale } from 'src/domain/shared/locale.type';

export class CreateInvitationTokenBodyDto {
  @IsString()
  @IsNotEmpty()
  establishmentId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  invitedEmail: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  assignedChatbots: number;

  @IsString()
  @IsIn([...LOCALES])
  locale: Locale;
}
