import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Suggestion } from 'src/domain/suggestion/suggestion.type';

export class CreateSuggestionBodyDto {
  @IsString()
  @MaxLength(200, { message: 'Title must be less than 200 characters' })
  @MinLength(3, { message: 'Title must be at least 10 characters' })
  @IsNotEmpty()
  title: string;

  @IsString()
  @MaxLength(200, { message: 'Content must be less than 1000 characters' })
  @MinLength(10, { message: 'Content must be at least 3 characters' })
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['teacher', 'student', 'establishment', 'standalone'])
  category: Suggestion['category'];
}
