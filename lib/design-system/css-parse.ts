export interface CssDeclaration {
  name: string;
  value: string;
}

export interface CssRule {
  body: string;
  declarations: readonly CssDeclaration[];
  header: string;
  rules: readonly CssRule[];
}

export interface GlobalsCss {
  root: ReadonlyMap<string, string>;
  rules: readonly CssRule[];
  theme: ReadonlyMap<string, string>;
  utilities: ReadonlyMap<string, CssRule>;
}

const quoteCharacters = new Set(['"', "'"]);

const stripComments = (source: string) =>
  source.replaceAll(/\/\*[\s\S]*?\*\//gu, "");

const matchingBrace = (source: string, openIndex: number) => {
  let depth = 0;
  let quote: string | null = null;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source.charAt(index);
    if (quote) {
      if (character === quote) {
        quote = null;
      }
    } else if (quoteCharacters.has(character)) {
      quote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  throw new Error("Unbalanced braces in CSS source");
};

const toDeclaration = (statement: string): CssDeclaration | null => {
  if (statement.startsWith("@")) {
    return null;
  }
  const separator = statement.indexOf(":");
  if (separator === -1) {
    return null;
  }
  return {
    name: statement.slice(0, separator).trim(),
    value: statement
      .slice(separator + 1)
      .replaceAll(/\s+/gu, " ")
      .trim(),
  };
};

interface ParsedBody {
  declarations: CssDeclaration[];
  rules: CssRule[];
}

const parseBody = (source: string): ParsedBody => {
  const declarations: CssDeclaration[] = [];
  const rules: CssRule[] = [];
  let start = 0;
  let parenDepth = 0;
  let quote: string | null = null;
  let index = 0;

  const pushStatement = (end: number) => {
    const declaration = toDeclaration(source.slice(start, end).trim());
    if (declaration) {
      declarations.push(declaration);
    }
  };

  while (index < source.length) {
    const character = source.charAt(index);
    if (quote) {
      if (character === quote) {
        quote = null;
      }
    } else if (quoteCharacters.has(character)) {
      quote = character;
    } else if (character === "(") {
      parenDepth += 1;
    } else if (character === ")") {
      parenDepth -= 1;
    } else if (parenDepth === 0 && character === ";") {
      pushStatement(index);
      start = index + 1;
    } else if (parenDepth === 0 && character === "{") {
      const close = matchingBrace(source, index);
      const body = source.slice(index + 1, close);
      const nested = parseBody(body);
      rules.push({
        body,
        declarations: nested.declarations,
        header: source.slice(start, index).trim(),
        rules: nested.rules,
      });
      start = close + 1;
      index = close;
    }
    index += 1;
  }
  pushStatement(source.length);
  return { declarations, rules };
};

export const parseCss = (source: string): CssRule[] =>
  parseBody(stripComments(source)).rules;

export const findRules = (
  rules: readonly CssRule[],
  predicate: (rule: CssRule) => boolean
): CssRule[] =>
  rules.flatMap((rule) => [
    ...(predicate(rule) ? [rule] : []),
    ...findRules(rule.rules, predicate),
  ]);

const toDeclarationMap = (rules: readonly CssRule[]) =>
  new Map(
    rules.flatMap((rule) =>
      rule.declarations.map(
        (declaration) => [declaration.name, declaration.value] as const
      )
    )
  );

const utilityHeaderPrefix = "@utility ";

const utilityName = (rule: CssRule) =>
  rule.header.startsWith(utilityHeaderPrefix)
    ? rule.header.slice(utilityHeaderPrefix.length).trim()
    : null;

const toUtilityMap = (rules: readonly CssRule[]) => {
  const utilities = new Map<string, CssRule>();
  for (const rule of rules) {
    const name = utilityName(rule);
    if (name) {
      utilities.set(name, rule);
    }
  }
  return utilities;
};

export const parseGlobalsCss = (source: string): GlobalsCss => {
  const rules = parseCss(source);
  return {
    root: toDeclarationMap(rules.filter((rule) => rule.header === ":root")),
    rules,
    theme: toDeclarationMap(
      rules.filter((rule) => rule.header === "@theme inline")
    ),
    utilities: toUtilityMap(rules),
  };
};

const indentOf = (line: string) => line.length - line.trimStart().length;

export const dedent = (text: string) => {
  const lines = text.split("\n");
  while (lines.length > 0 && lines[0]?.trim() === "") {
    lines.shift();
  }
  while (lines.length > 0 && lines.at(-1)?.trim() === "") {
    lines.pop();
  }
  let margin = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (line.trim() !== "") {
      margin = Math.min(margin, indentOf(line));
    }
  }
  const trimBy = Number.isFinite(margin) ? margin : 0;
  return lines.map((line) => line.slice(trimBy).trimEnd()).join("\n");
};

export const ruleToCss = (rule: CssRule) =>
  `${rule.header} {\n${dedent(rule.body)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")}\n}`;
