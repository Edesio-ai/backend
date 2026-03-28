import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

export const STRIPE_CLIENT = Symbol('STRIPE_CLIENT');

@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secretKey = configService.get<string>('STRIPE_SECRET_KEY') || null;

        if (!secretKey) throw new Error('STRIPE_SECRET_KEY is required.');

        return new Stripe(secretKey);
      },
    },
  ],
  exports: [STRIPE_CLIENT],
})

export class StripeModule {}