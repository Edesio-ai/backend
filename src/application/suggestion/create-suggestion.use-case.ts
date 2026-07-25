import { User } from 'src/domain/auth/types/auth.type';
import { Suggestion } from 'src/domain/suggestion/suggestion.type';
import {
  type ISuggestionRepository,
  SUGGESTION_REPOSITORY,
} from 'src/domain/suggestion/contracts/i-suggestion.repository';
import { Inject } from '@nestjs/common';

type CreateSuggestionBody = {
  title: string;
  content: string;
  category: Suggestion['category'];
};
export class CreateSuggestionUseCase {
  constructor(
    @Inject(SUGGESTION_REPOSITORY)
    private readonly suggestionRepository: ISuggestionRepository,
  ) {}

  async execute(body: CreateSuggestionBody, user: User): Promise<Suggestion | null> {
    const suggestionToCreate = {
      userId: user.id,
      userEmail: user.email,
      userName: user.metadata.firstname ?? null,
      category: body.category,
      title: body.title,
      content: body.content,
      likesCount: 0,
    };

    const suggestion = await this.suggestionRepository.createSuggestion(suggestionToCreate);
    return suggestion
      ? {
          ...suggestion,
          userHasLiked: false,
        }
      : null;
  }
}
