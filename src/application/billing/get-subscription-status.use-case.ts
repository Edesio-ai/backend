import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/auth/types/auth.type';
import {
  STRIPE_CLIENT_INTERFACE,
  type StripeClientInterface,
} from '../../domain/billing/contracts/stripe-client.interface';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from '../../domain/teaching/interface/establishment.repository';
import { TeacherNotFoundError } from 'src/domain/teaching/error';
import { EstablishmentNotFoundError } from 'src/domain/establishment/error';

@Injectable()
export class GetSubscriptionStatusUseCase {
  $;
  constructor(
    @Inject(STRIPE_CLIENT_INTERFACE)
    private readonly paymentClient: StripeClientInterface,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(user: User): Promise<any> {
    const { email, id } = user;
    const { role } = user.user_metadata;

    switch (role) {
      case 'student': {
        return {
          hasActiveSubscription: true,
          role,
        };
      }
      case 'teacher': {
        const teacher = await this.teacherRepository.getTeacherByUserId(id);
        if (!teacher) {
          throw new TeacherNotFoundError();
        }
        const isTeacherWithEstablishment = teacher?.establishment_id !== null;

        if (!isTeacherWithEstablishment) {
          return await this.handleSubscriptionFormat(email, id, role);
        }
        const establishment =
          await this.establishmentRepository.getEstablishmentById(
            teacher.establishment_id,
          );

        if (!establishment) {
          throw new EstablishmentNotFoundError('Establishment not found');
        }

        return await this.handleSubscriptionFormat(
          establishment.email,
          establishment.id,
          role,
        );
      }
      default: {
        return await this.handleSubscriptionFormat(email, id, role);
      }
    }
  }

  async handleSubscriptionFormat(email: string, id: string, role: string) {
    if (!email) {
      console.error(
        `Subscription check: no email for user ${id}, role=${role}`,
      );
      return { hasActiveSubscription: false, role };
    }

    const customers = await this.paymentClient.getCustomerByEmail(email);

    const customerId: string | null =
      customers.length > 0
        ? customers[0].id
        : await this.paymentClient.getCheckoutSessionByUserId(id);

    if (!customerId) {
      return {
        hasActiveSubscription: false,
        role,
      };
    }

    const subscriptions =
      await this.paymentClient.getSubscriptionsByCustomerId(customerId);
    const subscription = this.getSubscriptionStatus(subscriptions);

    const isActive =
      subscription.status === 'active' || subscription.status === 'trialing';
    const isPending =
      subscription.status === 'past_due' ||
      subscription.status === 'incomplete';
    const isWithinPeriod =
      subscription.cancel_at_period_end &&
      subscription.current_period_end * 1000 > Date.now();

    return {
      hasActiveSubscription: isActive || isWithinPeriod,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
      isPending,
      role,
    };
  }

  private getSubscriptionStatus(subscriptions: any): any {
    let subscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing',
    );

    if (!subscription) {
      subscription = subscriptions.data.find((sub) => {
        const isWithinPeriod =
          sub.cancel_at_period_end &&
          sub.current_period_end * 1000 > Date.now();
        return isWithinPeriod;
      });
    }

    if (!subscription) {
      subscription = subscriptions.data.find(
        (sub) => sub.status === 'past_due' || sub.status === 'incomplete',
      );
    }

    if (!subscription) {
      subscription = subscriptions.data[0];
    }

    return subscription;
  }
}
