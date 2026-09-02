import { LOCALES, type Locale } from 'src/domain/shared/locale.type';
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendInvitationBodyDto {
  @IsEmail()
  @IsNotEmpty()
  invitedEmail: string;

  @IsString()
  @IsNotEmpty()
  establishmentName: string;

  @IsString()
  @IsNotEmpty()
  invitationToken: string;

  @IsNumber()
  @IsNotEmpty()
  assignedChatbots: number;

  @IsOptional()
  @IsString()
  @IsIn([...LOCALES])
  locale?: Locale;
}
