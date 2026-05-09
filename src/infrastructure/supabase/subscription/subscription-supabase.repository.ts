import { Inject } from '@nestjs/common';
import { SUPABASE_ADMIN } from '../supabase.module';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';
import { SubscriptionRepository } from 'src/domain/teaching/interfaces/subscription.repository';

export class SubscriptionSupabaseRepository implements SubscriptionRepository {
  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: any,
  ) {}

  async getUserSubscription(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('subscription')
      .select('*')
      .eq('subscriber_id', userId);

    if (error) {
      const message = error instanceof Error ? error.message : '';
      throw new ServerError(`Error fetching subscription: ${message}`);
    }
    return data[0] || null;
  }
}
