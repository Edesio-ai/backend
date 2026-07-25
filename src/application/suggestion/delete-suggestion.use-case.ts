import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { User } from 'src/domain/auth/types/auth.type';
import {
  type ISuggestionRepository,
  SUGGESTION_REPOSITORY,
} from 'src/domain/suggestion/contracts/i-suggestion.repository';

export class DeleteSuggestionUseCase {
  constructor(
    @Inject(SUGGESTION_REPOSITORY)
    private readonly suggestionRepository: ISuggestionRepository,
  ) {}

  async execute(suggestionId: string, user: User): Promise<void> {
    const suggestion = await this.suggestionRepository.getSuggestionById(suggestionId);
    if (!suggestion) {
      console.error(`Suggestion not found with id ${suggestionId}`);
      throw new NotFoundException('Suggestion not found');
    }
    if (suggestion.userId !== user.id) {
      console.error(`User ${user.id} is not allowed to delete suggestion ${suggestionId}`);
      throw new ForbiddenException('You are not allowed to delete this suggestion');
    }

    await this.suggestionRepository.deleteSuggestion(suggestionId);
  }
}
