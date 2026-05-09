import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase.module';
import { SubscriptionSupabaseRepository } from './subscription-supabase.repository';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/teaching/interfaces/subscription.repository';

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
