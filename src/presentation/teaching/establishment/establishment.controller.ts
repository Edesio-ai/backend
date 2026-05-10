import { Body, Controller, Get, Post } from '@nestjs/common';

import { GetEstablishmentsStatsUseCase } from 'src/application/teaching/establishment/get-establishment-stats.use-case';
import { CreateEstablishmentUseCase } from 'src/application/teaching/establishment/create-establishment.use-case';
import { CreateEstablishmentBodyDto } from './dtos/create-establishment.dto';
import {
  Establishment,
  EstablishmentStats,
} from 'src/domain/teaching/establishment/types/establishment.type';
import { Roles } from '../../auth/decorator/role.decorator';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import { Public } from '../../auth/decorator/public.decorator';
import { SkipCsrf } from '../../auth/decorator/skip-csrf.decorator';
import type { AuthUser } from 'src/domain/auth/types/auth.type';

@Controller('establishment')
export class EstablishmentController {
  constructor(
    private readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase,
    private readonly createEstablishmentUseCase: CreateEstablishmentUseCase,
  ) {}

  @Roles('establishment')
  @Get('stats')
  async getEstablishmentStats(
    @CurrentUser() user: AuthUser,
  ): Promise<EstablishmentStats> {
    const stats = await this.getEstablishmentsStatsUseCase.execute(user.id);
    return stats;
  }

  @Public()
  @SkipCsrf()
  @Post('create')
  async createEstablishment(
    @Body() body: CreateEstablishmentBodyDto,
  ): Promise<Establishment> {
    const establishment = await this.createEstablishmentUseCase.execute(body);
    return establishment;
  }
}
