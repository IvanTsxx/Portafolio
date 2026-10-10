const MODULUS = 2_147_483_647;
const MULTIPLIER = 48_271;
const HASH_BASE = 131;

export const hashText = (text: string) => {
  let hash = 7;
  for (const character of text) {
    hash = (hash * HASH_BASE + (character.codePointAt(0) ?? 0)) % MODULUS;
  }
  return hash;
};

export const seededRandom = (seed: number) => {
  let state = (seed % (MODULUS - 1)) + 1;
  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return (state - 1) / (MODULUS - 1);
  };
};
