import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/role.decorator';
import { SendInvitationUseCase } from 'src/application/auth/send-invitation.use-case';
import { SendInvitationBodyDto } from './dtos/send-invitation-body.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly sendInvitationUseCase: SendInvitationUseCase) {}

  @UseGuards(JwtAuthGuard, CsrfGuard, RolesGuard)
  @Roles('establishment')
  @Post('send-invitation')
  async sendInvitation(
    @Body() body: SendInvitationBodyDto,
  ): Promise<{ success: boolean }> {
    await this.sendInvitationUseCase.execute(body);
    return { success: true };
  }
}
