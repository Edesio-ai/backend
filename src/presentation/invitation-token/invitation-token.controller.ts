import {
  Controller,
  Delete,
  Get,
  Param,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorator/role.decorator';
import { GlobalErrorFilter } from '../filters/global';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { DeleteInvitationTokenUseCase } from 'src/application/establishment/delete-invitation-token.use-case';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { GetInvitationTokenUseCase } from 'src/application/establishment/get-invitation-token.use-case';

@Controller('invtation-token')
export class InvitationTokenController {
  constructor(
    private readonly deleteInvitationTokenUseCase: DeleteInvitationTokenUseCase,
    private readonly getInvitationTokenUseCase: GetInvitationTokenUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @UseFilters(GlobalErrorFilter)
  @Roles('establishment')
  @Delete(':token')
  async deleteInvitationToken(
    @Param('token') token: string,
  ): Promise<{ success: boolean }> {
    await this.deleteInvitationTokenUseCase.execute(token);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('establishment')
  @Get(':establishmentId')
  @UseFilters(GlobalErrorFilter)
  async getInvitationToken(
    @Param('establishmentId') establishmentId: string,
  ): Promise<InvitationToken[]> {
    const tokens =
      await this.getInvitationTokenUseCase.execute(establishmentId);
    return tokens;
  }
}
