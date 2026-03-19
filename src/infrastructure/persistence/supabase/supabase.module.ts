import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_ADMIN = Symbol('SUPABASE_ADMIN');

@Module({
  providers: [
    {
      provide: SUPABASE_ADMIN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('SUPABASE_URL');
        const key = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!url) throw new Error('SUPABASE_URL is required.');
        if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required.');

        return createClient(url, key);
      },
    },
  ],
  exports: [SUPABASE_ADMIN],
})

export class SupabaseModule {}