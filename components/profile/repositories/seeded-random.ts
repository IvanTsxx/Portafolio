const randomModulus = 2 ** 32;

export const seededRandom = (seed: number) => {
  let state = Math.abs(Math.floor(seed)) % randomModulus;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % randomModulus;
    return state / randomModulus;
  };
};
