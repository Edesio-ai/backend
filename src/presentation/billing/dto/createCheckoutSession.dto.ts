import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckoutSessionBodyDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsNotEmpty()
  planType: string;
}
