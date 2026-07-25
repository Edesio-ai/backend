import { Body, Controller, Post } from '@nestjs/common';

import { SendInvitationBodyDto } from './dtos/send-invitation-body.dto';
import { SendInvitationUseCase } from 'src/application/email/send-invitation.use-case';

import { Roles } from '../auth/decorator/role.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly sendInvitationUseCase: SendInvitationUseCase) {}

  @Roles('establishment')
  @Post('send-invitation')
  async sendInvitation(@Body() body: SendInvitationBodyDto): Promise<{ success: boolean }> {
    await this.sendInvitationUseCase.execute(body);
    return { success: true };
  }
}
