import { COURSE_CONTENT_MAX_CHARS, truncateCourseContent } from './course-content.limits';

describe('truncateCourseContent', () => {
  it('returns content unchanged when under the limit', () => {
    const content = 'a'.repeat(100);

    expect(truncateCourseContent(content)).toEqual({ text: content, truncated: false });
  });

  it('truncates content longer than the default limit', () => {
    const content = 'a'.repeat(COURSE_CONTENT_MAX_CHARS + 500);
    const result = truncateCourseContent(content);

    expect(result.truncated).toBe(true);
    expect(result.text.startsWith('a'.repeat(COURSE_CONTENT_MAX_CHARS))).toBe(true);
    expect(result.text).toContain('[Contenu tronqué pour respecter la limite]');
    expect(result.text.length).toBeLessThan(content.length);
  });

  it('respects a custom maxChars', () => {
    const content = 'abcdefghij';

    expect(truncateCourseContent(content, 5)).toEqual({
      text: 'abcde\n\n[Contenu tronqué pour respecter la limite]',
      truncated: true,
    });
  });
});
