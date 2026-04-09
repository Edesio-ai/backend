import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSessionBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
