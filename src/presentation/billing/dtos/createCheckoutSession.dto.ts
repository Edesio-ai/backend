import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCheckoutSessionBodyDto {
  @IsString()
  @IsNotEmpty()
  priceId!: string;

  @IsString()
  @IsNotEmpty()
  planType!: string;

  /** Stripe Checkout UI locale (`en` | `fr`). Defaults to browser/`auto` if omitted. */
  @IsOptional()
  @IsString()
  @IsIn(['en', 'fr'])
  locale?: 'en' | 'fr';
}
