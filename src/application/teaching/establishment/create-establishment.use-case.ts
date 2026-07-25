import { Inject } from '@nestjs/common';
import {
  ESTABLISHMENT_REPOSITORY,
  type IEstablishmentRepository,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import { CreateEstablishmentBody, Establishment } from 'src/domain/teaching/establishment/types/establishment.type';

export class CreateEstablishmentUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
  ) {}

  async execute(body: CreateEstablishmentBody): Promise<Establishment> {
    const { supabaseUserId, name, email } = body;

    const establishment = await this.establishmentRepository.createEstablishment(supabaseUserId, name, email);
    return establishment;
  }
}
