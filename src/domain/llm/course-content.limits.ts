export const COURSE_CONTENT_MAX_CHARS = 60_000;

const COURSE_CONTENT_TRUNCATION_SUFFIX = '\n\n[Contenu tronqué pour respecter la limite]';

export type TruncatedCourseContent = {
  text: string;
  truncated: boolean;
};

export function truncateCourseContent(
  content: string,
  maxChars: number = COURSE_CONTENT_MAX_CHARS,
): TruncatedCourseContent {
  if (content.length <= maxChars) {
    return { text: content, truncated: false };
  }

  return {
    text: content.substring(0, maxChars) + COURSE_CONTENT_TRUNCATION_SUFFIX,
    truncated: true,
  };
}
