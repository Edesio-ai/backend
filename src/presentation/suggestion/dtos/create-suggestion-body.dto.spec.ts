import { validate } from 'class-validator';
import { CreateSuggestionBodyDto } from './create-suggestion-body.dto';

describe('CreateSuggestionBodyDto', () => {
  const valid = () =>
    Object.assign(new CreateSuggestionBodyDto(), {
      title: 'Valid title here',
      content: 'Valid content with enough length for validation rules.',
      category: 'teacher',
    });

  it('accepts a valid body', async () => {
    const errors = await validate(valid());

    expect(errors).toHaveLength(0);
  });

  it('accepts self-learner category', async () => {
    const dto = Object.assign(valid(), { category: 'self-learner' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects title shorter than minimum length', async () => {
    const dto = Object.assign(valid(), { title: 'ab' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects content shorter than minimum length', async () => {
    const dto = Object.assign(valid(), { content: 'short' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'content')).toBe(true);
  });

  it('rejects invalid category', async () => {
    const dto = Object.assign(valid(), { category: 'admin' as never });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('rejects empty title', async () => {
    const dto = Object.assign(valid(), { title: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });
});
