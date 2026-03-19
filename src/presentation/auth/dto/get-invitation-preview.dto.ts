import { IsNotEmpty, IsString } from 'class-validator';

export class GetInvitationPreviewParamsDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}