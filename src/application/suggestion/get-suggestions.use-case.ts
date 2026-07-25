import { ForbiddenException, Inject } from '@nestjs/common';
import { User } from 'src/domain/auth/types/auth.type';
import {
  SUGGESTION_REPOSITORY,
  type ISuggestionRepository,
} from 'src/domain/suggestion/contracts/i-suggestion.repository';
import { Suggestion } from 'src/domain/suggestion/suggestion.type';
import {
  type ISuggestionLikeRepository,
  SUGGESTION_LIKE_REPOSITORY,
} from 'src/domain/suggestion-like/contracts/suggestion-like.repository';

export class GetSuggestionsUseCase {
  constructor(
    @Inject(SUGGESTION_REPOSITORY)
    private readonly suggestionRepository: ISuggestionRepository,
    @Inject(SUGGESTION_LIKE_REPOSITORY)
    private readonly suggestionLikeRepository: ISuggestionLikeRepository,
  ) {}

  async execute(category: string, user: User): Promise<Suggestion[]> {
    const { role } = user.metadata;

    if (role !== category) {
      throw new ForbiddenException('You are not authorized to access this resource');
    }
    const suggestions = await this.suggestionRepository.getSuggestions(category);

    const suggestionIds = suggestions.map((suggestion) => suggestion.id);
    const userLikes = await this.suggestionLikeRepository.getUserLikes(user.id, suggestionIds);

    const suggestionsWithLikeStatus = suggestions.map((suggestion) => ({
      ...suggestion,
      userHasLiked: userLikes.includes(suggestion.id),
    }));

    return suggestionsWithLikeStatus;
  }
}
