import { Controller, Get } from '@nestjs/common';

import { GetEstablishmentsStatsUseCase } from 'src/application/teaching/establishment/get-establishment-stats.use-case';
import { EstablishmentStats } from 'src/domain/teaching/establishment/types/establishment.type';
import { Roles } from '../../auth/decorator/role.decorator';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import type { AuthUser } from 'src/domain/auth/types/auth.type';

@Controller('establishment')
export class EstablishmentController {
  constructor(private readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase) {}

  @Roles('establishment')
  @Get('stats')
  async getEstablishmentStats(@CurrentUser() user: AuthUser): Promise<EstablishmentStats> {
    const stats = await this.getEstablishmentsStatsUseCase.execute(user.id);
    return stats;
  }
}
