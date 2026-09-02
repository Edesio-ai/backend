import { LOCALES, type Locale } from 'src/domain/shared/locale.type';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCheckoutSessionBodyDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsNotEmpty()
  planType: string;

  /** Stripe Checkout UI locale. Defaults to browser/`auto` if omitted. */
  @IsOptional()
  @IsString()
  @IsIn([...LOCALES])
  locale?: Locale;
}
