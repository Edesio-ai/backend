import { Module } from '@nestjs/common';

import { EstablishmentController } from './establishment.controller';
import { GetEstablishmentsStatsUseCase } from '../../application/establishment/getEstablishmentStats.use-case';

@Module({
  imports: [],
  controllers: [EstablishmentController],
  providers: [
    GetEstablishmentsStatsUseCase,
  ],
})
export class EstablishmentModule {}