import { Controller, Get, Param } from '@nestjs/common';

import { GetInvitationPreviewUseCase } from '../../application/auth/get-invitation-preview.use-case';
import { InvitationTokenPreview } from '../../domain/auth/invitation.type';
import { GetInvitationPreviewParamsDto } from './dto/get-invitation-preview.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase) {}

  @Get('invitation-preview/:token')
  async getInvitationPreview(@Param() params: GetInvitationPreviewParamsDto): Promise<InvitationTokenPreview> {
    const invitationTokenPreview = await this.getInvitationPreviewUseCase.execute(params.token);
    return invitationTokenPreview;
  }
}
