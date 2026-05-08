import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { GetEstablishmentsStatsUseCase } from '../../../application/establishment/get-establishment-stats.use-case';
import { Roles } from '../../auth/decorator/role.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { SupabaseUser } from '../../../domain/auth/types/auth.type';
import { CreateEstablishmentUseCase } from '../../../application/establishment/create-establishment.use-case';
import { CreateEstablishmentBodyDto } from './dtos/create-establishment.dto';
import {
  Establishment,
  EstablishmentStats,
} from '../../../domain/teaching/types/establishment.type';

@Controller('establishment')
export class EstablishmentController {
  constructor(
    private readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase,
    private readonly createEstablishmentUseCase: CreateEstablishmentUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('establishment')
  @Get('stats')
  async getEstablishmentStats(
    @Req() req: Request & { user: SupabaseUser },
  ): Promise<EstablishmentStats> {
    const { user } = req;
    const stats = await this.getEstablishmentsStatsUseCase.execute(user.id);
    return stats;
  }

  @Post('create')
  async createEstablishment(
    @Body() body: CreateEstablishmentBodyDto,
  ): Promise<Establishment> {
    const establishment = await this.createEstablishmentUseCase.execute(body);
    return establishment;
  }
}
