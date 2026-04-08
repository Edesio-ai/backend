import { IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

export class ValidateTeacherInvitationBodyDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
