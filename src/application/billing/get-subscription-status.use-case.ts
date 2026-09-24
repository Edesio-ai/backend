import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/auth/types/auth.type';
import { STRIPE_PROVIDER, type IStripeProvider } from '../../domain/billing/contracts/i-stripe-client.provider';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  ESTABLISHMENT_REPOSITORY,
  type IEstablishmentRepository,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import {
  SubscriptionStatus,
  StripeSubscriptionLookupItem,
  StripeSubscriptionsLookup,
} from 'src/domain/billing/types/billing.type';

@Injectable()
export class GetSubscriptionStatusUseCase {
  constructor(
    @Inject(STRIPE_PROVIDER)
    private readonly stripeRepository: IStripeProvider,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
  ) {}

  async execute(user: User): Promise<SubscriptionStatus> {
    const { email, id } = user;
    const role = user.metadata.role ?? '';

    switch (role) {
      case 'student':
      case 'admin': {
        return {
          hasActiveSubscription: true,
          role,
        };
      }
      case 'teacher': {
        const teacher = await this.teacherRepository.getTeacherByUserId(id);
        if (!teacher) {
          throw new NotFoundError(`Teacher with id ${id} not found`);
        }
        const establishmentId = teacher.establishmentId;
        if (establishmentId === null) {
          return await this.handleSubscriptionFormat(email, id, role);
        }
        const establishment = await this.establishmentRepository.getEstablishmentById(establishmentId);

        if (!establishment) {
          throw new NotFoundError(`Establishment with id ${establishmentId} not found`);
        }

        return await this.handleSubscriptionFormat(establishment.email, establishment.id, role);
      }
      default: {
        return await this.handleSubscriptionFormat(email, id, role);
      }
    }
  }

  async handleSubscriptionFormat(email: string, id: string, role: string) {
    if (!email) {
      console.error(`Subscription check: no email for user ${id}, role=${role}`);
      return { hasActiveSubscription: false, role };
    }

    const customers = await this.stripeRepository.getCustomerByEmail(email);

    const customerId: string | null =
      customers.length > 0 ? customers[0].id : await this.stripeRepository.getCheckoutSessionByUserId(id);

    if (!customerId) {
      return {
        hasActiveSubscription: false,
        role,
      };
    }

    const subscriptions = await this.stripeRepository.getSubscriptionsByCustomerId(customerId);

    if (subscriptions.length === 0) {
      return {
        hasActiveSubscription: false,
        role,
      };
    }

    const subscription = this.getSubscriptionStatus(subscriptions);

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const isPending = subscription.status === 'past_due' || subscription.status === 'incomplete';
    const isWithinPeriod = subscription.cancel_at_period_end && subscription.current_period_end * 1000 > Date.now();

    return {
      hasActiveSubscription: isActive || isWithinPeriod,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
      isPending,
      role,
    };
  }

  private getSubscriptionStatus(subscriptions: StripeSubscriptionsLookup): StripeSubscriptionLookupItem {
    let subscription = subscriptions.find((sub) => sub.status === 'active' || sub.status === 'trialing');

    if (!subscription) {
      subscription = subscriptions.data.find((sub) => {
        const isWithinPeriod = sub.cancel_at_period_end && sub.current_period_end * 1000 > Date.now();
        return isWithinPeriod;
      });
    }

    if (!subscription) {
      subscription = subscriptions.data.find((sub) => sub.status === 'past_due' || sub.status === 'incomplete');
    }

    if (!subscription) {
      subscription = subscriptions.data[0];
    }

    return subscription;
  }
}
