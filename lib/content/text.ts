export interface Heading {
  depth: 2 | 3;
  id: string;
  text: string;
}

const wordsPerMinute = 220;

const metaExportPattern = /^export const meta\b[\s\S]*?^\}[^\n]*$/mu;

const fencePattern = /^\s*(?:```|~~~)/u;

const headingMarksPattern = /^#{2,3}(?=\s)/u;

const headingClosingMarksPattern = /\s+#+\s*$/u;

const linkPattern = /!?\[[^\]]*\]\([^)]*\)/gu;

const htmlTagPattern = /<[^>]+>/gu;

const emphasisUnderscorePattern = /(?<=^|\s)_(?=\S)|(?<=\S)_(?=\s|$)/gu;

const moduleLinePattern = /^(?:import|export)\s.*$/gmu;

const jsxTagPattern = /<\/?[A-Za-z][^>]*>/gu;

const wordPattern = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

const linkLabel = (link: string) =>
  link.slice(link.indexOf("[") + 1, link.indexOf("]"));

export const slugifyHeading = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
    .replaceAll(" ", "-");

const stripInlineMarkup = (text: string) =>
  text
    .replaceAll(linkPattern, linkLabel)
    .replaceAll(htmlTagPattern, "")
    .replaceAll(/[`*]/gu, "")
    .replaceAll(emphasisUnderscorePattern, "")
    .trim();

const linesOutsideFences = (body: string) => {
  const lines: string[] = [];
  let insideFence = false;
  for (const line of body.split("\n")) {
    if (fencePattern.test(line)) {
      insideFence = !insideFence;
    } else if (!insideFence) {
      lines.push(line);
    }
  }
  return lines;
};

export const hasMetaExport = (source: string) => metaExportPattern.test(source);

export const removeMetaExport = (source: string) =>
  source.replace(metaExportPattern, "");

export const extractHeadings = (body: string): Heading[] => {
  const headings: Heading[] = [];
  const occurrences = new Map<string, number>();

  for (const line of linesOutsideFences(body)) {
    const marks = headingMarksPattern.exec(line)?.[0];
    if (marks === undefined) {
      continue;
    }
    const headingText = stripInlineMarkup(
      line.slice(marks.length).replace(headingClosingMarksPattern, "")
    );
    const base = slugifyHeading(headingText);
    const seen = occurrences.get(base) ?? 0;
    occurrences.set(base, seen + 1);
    headings.push({
      depth: marks.length === 2 ? 2 : 3,
      id: seen === 0 ? base : `${base}-${seen}`,
      text: headingText,
    });
  }

  return headings;
};

export const countWords = (body: string) => {
  const prose = linesOutsideFences(body)
    .join("\n")
    .replaceAll(moduleLinePattern, " ")
    .replaceAll(jsxTagPattern, " ")
    .replaceAll(linkPattern, linkLabel);
  return prose.match(wordPattern)?.length ?? 0;
};

export const readingTimeMinutes = (wordCount: number) =>
  Math.max(1, Math.ceil(wordCount / wordsPerMinute));
