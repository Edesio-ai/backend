import { Inject } from '@nestjs/common';
import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from '../../domain/teaching/interface/establishment.repository';
import {
  CreateEstablishmentBody,
  Establishment,
} from '../../domain/teaching/types/establishment.type';

export class CreateEstablishmentUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(body: CreateEstablishmentBody): Promise<Establishment> {
    const { supabaseUserId, name, email } = body;

    const establishment =
      await this.establishmentRepository.createEstablishment(
        supabaseUserId,
        name,
        email,
      );
    return establishment;
  }
}
