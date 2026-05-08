import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../auth/decorator/role.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { DeleteInvitationTokenUseCase } from 'src/application/establishment/delete-invitation-token.use-case';
import {
  InvitationToken,
  InvitationTokenPreview,
} from 'src/domain/auth/invitation.type';
import { GetInvitationTokenUseCase } from 'src/application/establishment/get-invitation-token.use-case';
import type { AuthUser } from 'src/domain/auth/types/auth.type';
import { ValidateTeacherInvitationBodyDto } from './dtos/validate-teacher-invitation-body.dto';
import { ValidateTeacherInvitationUseCase } from 'src/application/teacher/validate-teacher-invitation.use-case';
import { GetInvitationPreviewParamsDto } from './dtos/get-invitation-preview.dto';
import { GetInvitationPreviewUseCase } from 'src/application/auth/get-invitation-preview.use-case';
import { CreateInvitationTokenBodyDto } from './dtos/create-invitation-token.dto';
import { CreateInvitationTokenUseCase } from 'src/application/auth/create-invitation-token.use-case';

@Roles('establishment')
@Controller('invtation-token')
export class InvitationTokenController {
  constructor(
    private readonly deleteInvitationTokenUseCase: DeleteInvitationTokenUseCase,
    private readonly getInvitationTokenUseCase: GetInvitationTokenUseCase,
    private readonly getInvitationPreviewUseCase: GetInvitationPreviewUseCase,
    private readonly validateTeacherInvitationUseCase: ValidateTeacherInvitationUseCase,
    private readonly createInvitationTokenUseCase: CreateInvitationTokenUseCase,
  ) {}

  @Delete(':token')
  async deleteInvitationToken(
    @Param('token') token: string,
  ): Promise<{ success: boolean }> {
    await this.deleteInvitationTokenUseCase.execute(token);
    return { success: true };
  }

  @Get('establishment/:establishmentId')
  async getEstablishmentInvitationTokens(
    @Param('establishmentId') establishmentId: string,
  ): Promise<InvitationToken[]> {
    const tokens =
      await this.getInvitationTokenUseCase.execute(establishmentId);
    return tokens;
  }

  @Get('preview/:token')
  async getInvitationPreview(
    @Param() params: GetInvitationPreviewParamsDto,
  ): Promise<InvitationTokenPreview> {
    const invitationTokenPreview =
      await this.getInvitationPreviewUseCase.execute(params.token);
    return invitationTokenPreview;
  }

  @Post()
  async createInvitationToken(
    @Body() body: CreateInvitationTokenBodyDto,
  ): Promise<{ success: boolean }> {
    await this.createInvitationTokenUseCase.execute(body);
    return { success: true };
  }

  @Roles('teacher')
  @Post('validate')
  async validateTeacherInvitation(
    @CurrentUser() user: AuthUser,
    @Body() body: ValidateTeacherInvitationBodyDto,
  ): Promise<any> {
    const { id } = user;
    const invitationToken = await this.validateTeacherInvitationUseCase.execute(
      id,
      body.token,
    );

    return {
      success: true,
      etablissementId: invitationToken?.establishmentId,
    };
  }
}
