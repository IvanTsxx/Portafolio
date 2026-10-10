export type MatchRange = readonly [start: number, end: number];

export interface SearchableField {
  fuzzy?: boolean;
  text: string;
  weight: number;
}

export interface QueryMatch {
  ranges: readonly (readonly MatchRange[])[];
  score: number;
}

export interface TextSegment {
  matched: boolean;
  start: number;
  text: string;
}

interface TokenMatch {
  ranges: readonly MatchRange[];
  score: number;
}

const FUZZY_MIN_TOKEN_LENGTH = 4;
const FUZZY_SPAN_PER_CHARACTER = 2;
const FUZZY_SPAN_SLACK = 2;
const EXACT_FIELD_BONUS = 40;

const SCORE_PREFIX = 100;
const SCORE_WORD_START = 80;
const SCORE_INSIDE_WORD = 40;
const SCORE_FUZZY_BASE = 30;
const SCORE_FUZZY_MIN = 5;

const wordCharacter = /[\p{L}\p{N}]/u;

export const tokenizeQuery = (query: string) =>
  query
    .trim()
    .split(/\s+/u)
    .filter((token) => token.length > 0);

const foldCase = (value: string) => {
  let folded = "";
  for (const character of value) {
    const lowered = character.toLowerCase();
    folded += lowered.length === character.length ? lowered : character;
  }
  return folded;
};

const startsWord = (text: string, index: number) =>
  index === 0 || !wordCharacter.test(text.charAt(index - 1));

const substringScore = (text: string, index: number) => {
  if (index === 0) {
    return SCORE_PREFIX;
  }
  return startsWord(text, index) ? SCORE_WORD_START : SCORE_INSIDE_WORD;
};

const findSubstring = (token: string, text: string): TokenMatch | null => {
  let best: TokenMatch | null = null;
  let from = text.indexOf(token);
  while (from !== -1) {
    const score = substringScore(text, from);
    if (!best || score > best.score) {
      best = { ranges: [[from, from + token.length]], score };
    }
    from = text.indexOf(token, from + 1);
  }
  return best;
};

const collectSubsequence = (token: string, text: string, start: number) => {
  const indices: number[] = [];
  let cursor = start;
  for (const character of token) {
    const found = text.indexOf(character, cursor);
    if (found === -1) {
      return null;
    }
    indices.push(found);
    cursor = found + character.length;
  }
  return indices;
};

const mergeRanges = (ranges: readonly MatchRange[]): MatchRange[] => {
  const sorted = ranges.toSorted(
    (first, second) => first[0] - second[0] || first[1] - second[1]
  );
  const merged: [number, number][] = [];
  for (const [start, end] of sorted) {
    const last = merged.at(-1);
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
};

const findSubsequence = (token: string, text: string): TokenMatch | null => {
  if (token.length < FUZZY_MIN_TOKEN_LENGTH) {
    return null;
  }
  const maxSpan = token.length * FUZZY_SPAN_PER_CHARACTER + FUZZY_SPAN_SLACK;
  let bestIndices: number[] | null = null;
  let bestSpan = Number.POSITIVE_INFINITY;
  let from = text.indexOf(token.charAt(0));
  while (from !== -1) {
    const indices = collectSubsequence(token, text, from);
    if (!indices) {
      break;
    }
    const span = (indices.at(-1) ?? from) - from + 1;
    if (span < bestSpan) {
      bestIndices = indices;
      bestSpan = span;
    }
    from = text.indexOf(token.charAt(0), from + 1);
  }
  if (!bestIndices || bestSpan > maxSpan) {
    return null;
  }
  const gaps = bestSpan - token.length;
  return {
    ranges: mergeRanges(bestIndices.map((index) => [index, index + 1])),
    score: Math.max(SCORE_FUZZY_MIN, SCORE_FUZZY_BASE - gaps),
  };
};

const matchToken = (
  token: string,
  text: string,
  fuzzy: boolean
): TokenMatch | null => {
  const exact = findSubstring(token, text);
  if (exact) {
    return token.length === text.length
      ? { ...exact, score: exact.score + EXACT_FIELD_BONUS }
      : exact;
  }
  return fuzzy ? findSubsequence(token, text) : null;
};

export const matchQuery = (
  query: string,
  fields: readonly SearchableField[]
): QueryMatch | null => {
  const tokens = tokenizeQuery(foldCase(query));
  const rangesByField: MatchRange[][] = fields.map(() => []);
  if (tokens.length === 0) {
    return { ranges: rangesByField, score: 0 };
  }
  const foldedTexts = fields.map((field) => foldCase(field.text));
  let totalScore = 0;
  for (const token of tokens) {
    let best: { fieldIndex: number; match: TokenMatch; score: number } | null =
      null;
    for (const [fieldIndex, foldedText] of foldedTexts.entries()) {
      const field = fields[fieldIndex];
      const match = matchToken(token, foldedText, field?.fuzzy ?? false);
      const weight = field?.weight ?? 0;
      if (match && (!best || match.score * weight > best.score)) {
        best = { fieldIndex, match, score: match.score * weight };
      }
    }
    if (!best) {
      return null;
    }
    rangesByField[best.fieldIndex]?.push(...best.match.ranges);
    totalScore += best.score;
  }
  return {
    ranges: rangesByField.map(mergeRanges),
    score: totalScore / tokens.length,
  };
};

export const segmentText = (
  text: string,
  ranges: readonly MatchRange[]
): TextSegment[] => {
  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const [start, end] of mergeRanges(ranges)) {
    const from = Math.max(start, cursor);
    const to = Math.min(end, text.length);
    if (to <= from) {
      continue;
    }
    if (from > cursor) {
      segments.push({
        matched: false,
        start: cursor,
        text: text.slice(cursor, from),
      });
    }
    segments.push({ matched: true, start: from, text: text.slice(from, to) });
    cursor = to;
  }
  if (cursor < text.length) {
    segments.push({ matched: false, start: cursor, text: text.slice(cursor) });
  }
  return segments;
};
