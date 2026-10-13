export interface NarratedSection<Key> {
  key: Key;
  lines: readonly string[];
}

export interface Narration<Key> {
  key: Key | null;
  line: string | null;
  visits: ReadonlyMap<Key, number>;
}

export interface NarrationInput<Key> {
  isFast: boolean;
  isPressed: boolean;
  section: NarratedSection<Key> | null;
}

export interface NarrationStep<Key> {
  isShown: boolean;
  narration: Narration<Key>;
}

export const fastScrollSpeed = 1200;

export const isFastScroll = (velocity: number) =>
  Math.abs(velocity) > fastScrollSpeed;

export const silence = <Key>(): Narration<Key> => ({
  key: null,
  line: null,
  visits: new Map(),
});

const speak = <Key>(
  narration: Narration<Key>,
  section: NarratedSection<Key> | null
): Narration<Key> => {
  if (!section || section.lines.length === 0) {
    return { ...narration, key: section?.key ?? null, line: null };
  }
  const visit = narration.visits.get(section.key) ?? 0;
  return {
    key: section.key,
    line: section.lines[visit % section.lines.length] ?? null,
    visits: new Map(narration.visits).set(section.key, visit + 1),
  };
};

export const narrate = <Key>(
  narration: Narration<Key>,
  { isFast, isPressed, section }: NarrationInput<Key>
): NarrationStep<Key> => {
  if (isFast) {
    return { isShown: false, narration };
  }
  const isNewSection = (section?.key ?? null) !== narration.key;
  const next =
    isNewSection || (isPressed && section)
      ? speak(narration, section)
      : narration;
  return { isShown: next.line !== null, narration: next };
};
