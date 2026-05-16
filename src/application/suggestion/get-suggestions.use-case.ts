import { ForbiddenException, Inject } from '@nestjs/common';
import { User } from 'src/domain/auth/types/auth.type';
import {
  SUGGESTION_REPOSITORY,
  type ISuggestionRepository,
} from 'src/domain/suggestion/contracts/i-suggestion.repository';
import { Suggestion } from 'src/domain/suggestion/suggestion.type';

export class GetSuggestionsUseCase {
  constructor(
    @Inject(SUGGESTION_REPOSITORY)
    private readonly suggestionRepository: ISuggestionRepository,
  ) {}

  async execute(category: string, user: User): Promise<Suggestion[]> {
    const { role } = user.metadata;

    if (role !== category) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }
    const suggestions =
      await this.suggestionRepository.getSuggestions(category);

    const suggestionIds = suggestions.map((suggestion) => suggestion.id);
    const userLikes = await this.suggestionRepository.getUserLikes(
      user.id,
      suggestionIds,
    );

    const suggestionsWithLikeStatus = suggestions.map((suggestion) => ({
      ...suggestion,
      userHasLiked: userLikes.includes(suggestion.id),
    }));

    return suggestionsWithLikeStatus;
  }
}
