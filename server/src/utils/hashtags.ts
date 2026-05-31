const HASHTAG_REGEX = /#(\w{1,50})/g;

export function parseHashtags(content: string): string[] {
  const matches = content.match(HASHTAG_REGEX);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}
