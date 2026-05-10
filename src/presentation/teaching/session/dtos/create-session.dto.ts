import { IsNotEmpty, IsString } from 'class-validator';
import { type Language } from 'src/domain/teaching/session/types/session.type';

export class CreateSessionBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  language: Language;

  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
