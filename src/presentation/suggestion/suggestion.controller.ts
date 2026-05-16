import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { GetSuggestionsUseCase } from 'src/application/suggestion/get-suggestions.use-case';
import { type User } from 'src/domain/auth/types/auth.type';

@Controller('suggestion')
export class SuggestionController {
  constructor(private readonly getSuggestionsUseCase: GetSuggestionsUseCase) {}

  @Get(':category')
  async getSuggestions(
    @CurrentUser() user: User,
    @Param('category') category: string,
  ) {
    return this.getSuggestionsUseCase.execute(category, user);
  }
}
