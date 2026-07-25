import { Inject } from '@nestjs/common';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { ISubscriptionRepository } from 'src/domain/subscription/contracts/i-subscription.repository';
import { SUPABASE_ADMIN } from '../../supabase.module';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserSubscriptionRecord } from 'src/domain/billing/types/billing.type';

export class SubscriptionSupabaseRepository implements ISubscriptionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  async getUserSubscription(userId: string): Promise<UserSubscriptionRecord | null> {
    const { data, error } = await this.supabase.from('subscription').select('*').eq('subscriber_id', userId);

    if (error) {
      const message = error instanceof Error ? error.message : '';
      throw new ServerError(`Error fetching subscription: ${message}`);
    }
    const row = data?.[0] as UserSubscriptionRecord | undefined;
    return row ?? null;
  }
}
