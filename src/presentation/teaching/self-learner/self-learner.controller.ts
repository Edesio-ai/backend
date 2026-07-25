import { Controller, Get, Post } from '@nestjs/common';
import { CreateSelfLearnerUseCase } from 'src/application/teaching/self-learner/create-self-learner.use-case';
import { GetSelfLearnerUseCase } from 'src/application/teaching/self-learner/get-self-learner.use-case';
import { type AuthUser } from 'src/domain/auth/types/auth.type';
import { SelfLearner } from 'src/domain/teaching/self-learner/types/self-learner.type';
import { CurrentUser } from 'src/presentation/auth/decorator/current-user.decorator';
import { Roles } from 'src/presentation/auth/decorator/role.decorator';

@Roles('self-learner')
@Controller('self-learner')
export class SelfLearnerController {
  constructor(
    private readonly getSelfLearnerUseCase: GetSelfLearnerUseCase,
    private readonly createSelfLearnerUseCase: CreateSelfLearnerUseCase,
  ) {}

  @Get()
  async getSelfLearner(@CurrentUser() user: AuthUser): Promise<SelfLearner | null> {
    return await this.getSelfLearnerUseCase.execute(user);
  }

  @Post()
  async createSelfLearner(@CurrentUser() user: AuthUser): Promise<SelfLearner> {
    return await this.createSelfLearnerUseCase.execute(user);
  }
}
