import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateInvitationTokenBodyDto {
    @IsString()
    @IsNotEmpty()
    establishmentId: string;

    @IsString()
    @IsNotEmpty()
    token: string

    @IsEmail()
    @IsNotEmpty()
    invitedEmail: string;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    expiresAt: Date;

    @IsNumber()
    @IsNotEmpty()
    assignedChatbots: number;
}