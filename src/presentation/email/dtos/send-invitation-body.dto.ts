import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}
