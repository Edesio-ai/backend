import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { GetEstablishmentsStatsUseCase } from '../../../application/establishment/get-establishment-stats.use-case';
import { Roles } from '../../auth/decorator/role.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { SupabaseUser } from '../../../domain/auth/types/auth.type';
import { CreateEstablishmentUseCase } from '../../../application/establishment/create-establishment.use-case';
import { CreateEstablishmentBodyDto } from '../dto/establishment/create-establishment.dto';
import {
  Establishment,
  EstablishmentStats,
} from '../../../domain/teaching/types/establishment.type';
import { GetInvitationTokenUseCase } from '../../../application/establishment/get-invitation-token.use-case';
import { InvitationToken } from '../../../domain/auth/invitation.type';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { DeleteInvitationTokenUseCase } from 'src/application/establishment/delete-invitation-token.use-case';
import { TokenErrorFilter } from '../../filters/token.filter';
import { GlobalErrorFilter } from 'src/presentation/filters/shared.filter';

@Controller('establishment')
export class EstablishmentController {
  constructor(
    private readonly getEstablishmentsStatsUseCase: GetEstablishmentsStatsUseCase,
    private readonly createEstablishmentUseCase: CreateEstablishmentUseCase,
    private readonly getInvitationTokenUseCase: GetInvitationTokenUseCase,
    private readonly deleteInvitationTokenUseCase: DeleteInvitationTokenUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('establishment')
  @Get('stats')
  @UseFilters(GlobalErrorFilter)
  async getEstablishmentStats(
    @Req() req: Request & { user: SupabaseUser },
  ): Promise<EstablishmentStats> {
    const { user } = req;
    const stats = await this.getEstablishmentsStatsUseCase.execute(user.id);
    return stats;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('establishment')
  @Get('invitation-token/:establishmentId')
  @UseFilters(GlobalErrorFilter)
  async getInvitationToken(
    @Param('establishmentId') establishmentId: string,
  ): Promise<InvitationToken[]> {
    const tokens =
      await this.getInvitationTokenUseCase.execute(establishmentId);
    return tokens;
  }

  @Post('create')
  async createEstablishment(
    @Body() body: CreateEstablishmentBodyDto,
  ): Promise<Establishment> {
    const establishment = await this.createEstablishmentUseCase.execute(body);
    return establishment;
  }

  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @UseFilters(TokenErrorFilter)
  @Roles('establishment')
  @Delete('invitation-token/:token')
  async deleteInvitationToken(
    @Param('token') token: string,
  ): Promise<{ success: boolean }> {
    await this.deleteInvitationTokenUseCase.execute(token);
    return { success: true };
  }
}
