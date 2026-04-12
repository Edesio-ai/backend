import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase.module';
import { SUBSCRIPTION_REPOSITORY } from '../../../domain/teaching/interface/subscription.repository';
import { SubscriptionSupabaseRepository } from './subscription-supabase.repository';

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
