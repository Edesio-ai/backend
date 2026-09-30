import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSessionBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
