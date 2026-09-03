import { Body, Controller, Delete, Get, Param, Post, UseFilters } from '@nestjs/common';
import { Roles } from '../auth/decorator/role.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { GetInvitationTokenUseCase } from 'src/application/teaching/invitation-token/get-invitation-token.use-case';
import { InvitationToken, InvitationTokenPreview } from 'src/domain/auth/invitation.type';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { ValidateTeacherInvitationBodyDto } from './dtos/validate-teacher-invitation-body.dto';
import { ValidateTeacherInvitationUseCase } from 'src/application/teaching/invitation-token/validate-teacher-invitation.use-case';
import { GetInvitationPreviewParamsDto } from './dtos/get-invitation-preview.dto';
import { GetInvitationPreviewUseCase } from 'src/application/teaching/invitation-token/get-invitation-preview.use-case';
import { CreateInvitationTokenBodyDto } from './dtos/create-invitation-token.dto';
import { DeleteInvitationTokenUseCase } from 'src/application/teaching/invitation-token/delete-invitation-token.use-case';
import { CreateInvitationTokenUseCase } from 'src/application/teaching/invitation-token/create-invitation-token.use-case';
import { Public } from '../auth/decorator/public.decorator';
import { GlobalErrorFilter } from '../filters/global.filter';

@Roles('establishment')
@UseFilters(GlobalErrorFilter)
@Controller('invitation-token')
export class InvitationTokenController {
  constructor(
    private readonly deleteInvitationTokenUseCase: DeleteInvitationTokenUseCase,
    private readonly getInvitationTokenUseCase: GetInvitationTokenUseCase,
    private readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase,
    private readonly validateTeacherInvitationUseCase: ValidateTeacherInvitationUseCase,
    private readonly createInvitationTokenUseCase: CreateInvitationTokenUseCase,
  ) {}

  @Delete(':token')
  async deleteInvitationToken(@Param('token') token: string): Promise<{ success: boolean }> {
    await this.deleteInvitationTokenUseCase.execute(token);
    return { success: true };
  }

  @Get('establishment/:establishmentId')
  async getEstablishmentInvitationTokens(
    @Param('establishmentId') establishmentId: string,
  ): Promise<InvitationToken[]> {
    const tokens = await this.getInvitationTokenUseCase.execute(establishmentId);
    return tokens;
  }

  @Public()
  @Get('preview/:token')
  async getInvitationPreview(@Param() params: GetInvitationPreviewParamsDto): Promise<InvitationTokenPreview> {
    const invitationTokenPreview = await this.getInvitationPreviewUseCase.execute(params.token);
    return invitationTokenPreview;
  }

  @Post()
  async createInvitationToken(@Body() body: CreateInvitationTokenBodyDto): Promise<{ success: boolean }> {
    await this.createInvitationTokenUseCase.execute(body);
    return { success: true };
  }

  @Roles('teacher')
  @Post('validate')
  async validateTeacherInvitation(
    @CurrentUser() user: AuthUser,
    @Body() body: ValidateTeacherInvitationBodyDto,
  ): Promise<{ success: boolean; etablissementId?: string }> {
    const { id } = user;
    const invitationToken = await this.validateTeacherInvitationUseCase.execute(id, body.token);

    return {
      success: true,
      etablissementId: invitationToken?.establishmentId,
    };
  }
}
