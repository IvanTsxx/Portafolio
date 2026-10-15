const languageOverrides = new Map([["Python", "TypeScript"]]);

export const displayLanguage = (language: string | null) =>
  language === null ? null : (languageOverrides.get(language) ?? language);
