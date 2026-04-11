import { IsNotEmpty, IsString } from 'class-validator';
import { type SessionLanguage } from 'src/domain/teaching/session.type';

export class CreateSessionBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  language: SessionLanguage;

  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
