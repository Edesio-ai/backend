import { Inject } from '@nestjs/common';
import { User } from 'src/domain/auth/types/auth.type';
import {
  STRIPE_PROVIDER,
  type IStripeProvider,
} from 'src/domain/billing/contracts/i-stripe-client.provider';
import { StripeSubscription } from 'src/domain/billing/types/billing.type';
import {
  type ITeacherRepository,
  TEACHER_REPOSITORY,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  type IEstablishmentRepository,
  ESTABLISHMENT_REPOSITORY,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';

export class GetSubscriptionUseCase {
  constructor(
    @Inject(STRIPE_PROVIDER)
    private readonly stripeRepository: IStripeProvider,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
  ) {}

  async execute(user: User): Promise<StripeSubscription | null> {
    const { email } = user;
    const { role } = user.metadata;

    if (role === 'teacher') {
      const teacher = await this.teacherRepository.getTeacherByUserId(user.id);
      if (teacher && teacher.establishmentId) {
        const establishmentSubscription =
          await this.getEstablishmentSubscription(teacher.establishmentId);
        if (establishmentSubscription) {
          establishmentSubscription.isEstablishmentSubscription = true;
        }
        return establishmentSubscription;
      }
    }
    const subscriptions =
      await this.stripeRepository.getUserSubscription(email);

    return subscriptions;
  }

  private async getEstablishmentSubscription(
    establishmentId: string,
  ): Promise<StripeSubscription | null> {
    const establishment =
      await this.establishmentRepository.getEstablishmentById(establishmentId);
    if (establishment) {
      return await this.stripeRepository.getUserSubscription(
        establishment.email,
      );
    }
    return null;
  }
}
