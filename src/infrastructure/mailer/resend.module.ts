import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";


export const RESEND_CLIENT = Symbol('RESEND_CLIENT');

@Module({
  providers: [
    {
      provide: RESEND_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('RESEND_API_KEY');

        if (!apiKey) throw new Error('RESEND_API_KEY is required.');

        return new Resend(apiKey);
      },
    },
  ],
  exports: [RESEND_CLIENT],
})

export class ResendModule {}