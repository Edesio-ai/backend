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
import { Roles } from '../auth/decorator/role.decorator';
import { GlobalErrorFilter } from '../filters/global';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { DeleteInvitationTokenUseCase } from 'src/application/establishment/delete-invitation-token.use-case';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { GetInvitationTokenUseCase } from 'src/application/establishment/get-invitation-token.use-case';
import { SupabaseUser } from 'src/domain/auth/types/auth.type';
import { ValidateTeacherInvitationBodyDto } from './dtos/validate-teacher-invitation-body.dto';
import { ValidateTeacherInvitationUseCase } from 'src/application/teacher/validate-teacher-invitation.use-case';

@UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
@Roles('establishment')
@UseFilters(GlobalErrorFilter)
@Controller('invtation-token')
export class InvitationTokenController {
  constructor(
    private readonly deleteInvitationTokenUseCase: DeleteInvitationTokenUseCase,
    private readonly getInvitationTokenUseCase: GetInvitationTokenUseCase,
    private readonly validateTeacherInvitationUseCase: ValidateTeacherInvitationUseCase,
  ) {}

  @Delete(':token')
  async deleteInvitationToken(
    @Param('token') token: string,
  ): Promise<{ success: boolean }> {
    await this.deleteInvitationTokenUseCase.execute(token);
    return { success: true };
  }

  @Get(':establishmentId')
  async getInvitationToken(
    @Param('establishmentId') establishmentId: string,
  ): Promise<InvitationToken[]> {
    const tokens =
      await this.getInvitationTokenUseCase.execute(establishmentId);
    return tokens;
  }

  @Roles('teacher')
  @Post('validate')
  async validateTeacherInvitation(
    @Req() req: Request & { user: SupabaseUser },
    @Body() body: ValidateTeacherInvitationBodyDto,
  ): Promise<any> {
    const { user } = req;
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
