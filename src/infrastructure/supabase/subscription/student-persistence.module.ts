import { Module } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/subscription/contracts/subscription.repository';
import { SupabaseModule } from '../supabase.module';
import { SubscriptionSupabaseRepository } from './repositories/subscription-supabase.repository';

@Module({
  imports: [SupabaseModule],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionSupabaseRepository,
    },
  ],
  exports: [SUBSCRIPTION_REPOSITORY],
})
export class SubscriptionPersistenceModule {}
