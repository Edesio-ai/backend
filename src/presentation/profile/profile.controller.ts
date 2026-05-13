import { Body, Controller, Patch } from '@nestjs/common';
import { UpdateProfileBodyDto } from './dtos/update-profile-body.dto';
import { type AuthUser } from 'src/domain/auth/types/auth.type';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateProfileUseCase } from 'src/application/profile/update-profile.use-case';

@Controller('profile')
export class ProfileController {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  @Patch()
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProfileBodyDto,
  ): Promise<void> {
    await this.updateProfileUseCase.execute(user, body);
  }
}
