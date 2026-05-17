import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetSuggestionsUseCase } from 'src/application/suggestion/get-suggestions.use-case';
import { type User } from 'src/domain/auth/types/auth.type';
import { LikeSuggestionUseCase } from 'src/application/suggestion/like-suggestion.use-case';
import { CreateSuggestionBodyDto } from './dtos/create-suggestion-body.dto';
import { Suggestion } from 'src/domain/suggestion/suggestion.type';
import { CreateSuggestionUseCase } from 'src/application/suggestion/create-suggestion.use-case';

@Controller('suggestion')
export class SuggestionController {
  constructor(
    private readonly getSuggestionsUseCase: GetSuggestionsUseCase,
    private readonly likeSuggestionUseCase: LikeSuggestionUseCase,
    private readonly createSuggestionUseCase: CreateSuggestionUseCase,
  ) {}

  @Get('category/:category')
  async getSuggestions(
    @CurrentUser() user: User,
    @Param('category') category: string,
  ) {
    return this.getSuggestionsUseCase.execute(category, user);
  }

  @Post(':suggestionId/like')
  async likeSuggestion(
    @CurrentUser() user: User,
    @Param('suggestionId') suggestionId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    return this.likeSuggestionUseCase.execute(suggestionId, user);
  }

  @Post()
  async createSuggestion(
    @CurrentUser() user: User,
    @Body() body: CreateSuggestionBodyDto,
  ): Promise<Suggestion | null> {
    return await this.createSuggestionUseCase.execute(body, user);
  }
}
