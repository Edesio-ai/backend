import { Inject, NotFoundException } from '@nestjs/common';
import {
  type ISuggestionRepository,
  SUGGESTION_REPOSITORY,
} from 'src/domain/suggestion/contracts/i-suggestion.repository';
import { type User } from 'src/domain/auth/types/auth.type';
import {
  type ISuggestionLikeRepository,
  SUGGESTION_LIKE_REPOSITORY,
} from 'src/domain/suggestion-like/contracts/suggestion-like.repository';

export class LikeSuggestionUseCase {
  constructor(
    @Inject(SUGGESTION_REPOSITORY)
    private readonly suggestionRepository: ISuggestionRepository,
    @Inject(SUGGESTION_LIKE_REPOSITORY)
    private readonly suggestionLikeRepository: ISuggestionLikeRepository,
  ) {}

  async execute(suggestionId: string, user: User): Promise<{ liked: boolean; likesCount: number }> {
    const suggestion = await this.suggestionRepository.getSuggestionLikesCountById(suggestionId);
    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    const likeId = await this.suggestionLikeRepository.getSuggestionLikeByUserAndSuggestionId(user.id, suggestionId);

    if (likeId) {
      return this.unlikeSuggestion(likeId, suggestionId, suggestion.likesCount);
    } else {
      return this.likeSuggestion(suggestionId, user, suggestion.likesCount);
    }
  }

  private async unlikeSuggestion(
    existingLikeId: string,
    suggestionId: string,
    likesCount: number,
  ): Promise<{ liked: boolean; likesCount: number }> {
    await this.suggestionLikeRepository.deleteSuggestionLikeById(existingLikeId);
    await this.suggestionRepository.decrementLike(suggestionId, likesCount);
    return {
      liked: false,
      likesCount: Math.max(0, (likesCount || 0) - 1),
    };
  }

  private async likeSuggestion(
    suggestionId: string,
    user: User,
    likesCount: number,
  ): Promise<{ liked: boolean; likesCount: number }> {
    await this.suggestionLikeRepository.createSuggestionLike(suggestionId, user.id);
    await this.suggestionRepository.incrementLike(suggestionId, likesCount);
    return {
      liked: true,
      likesCount: Math.max(0, (likesCount || 0) + 1),
    };
  }
}
