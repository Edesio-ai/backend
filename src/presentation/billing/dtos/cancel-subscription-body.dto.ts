import { LOCALES, type Locale } from 'src/domain/shared/locale.type';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CancelSubscriptionBodyDto {
  @IsOptional()
  @IsString()
  @IsIn([...LOCALES])
  locale?: Locale;
}
