const strikeLength = 0.9;
const firstRise = 0.05;
const secondDelay = 0.2;
const secondRise = 0.04;
const secondPeak = 0.75;

export const flashEnvelope = (age: number) => {
  if (age < 0 || age > strikeLength) {
    return 0;
  }
  const first =
    age < firstRise ? age / firstRise : Math.exp(-(age - firstRise) * 14);
  const secondAge = age - secondDelay;
  let second = 0;
  if (secondAge >= 0) {
    second =
      secondAge < secondRise
        ? (secondAge / secondRise) * secondPeak
        : secondPeak * Math.exp(-(secondAge - secondRise) * 6);
  }
  return Math.min(first + second, 1);
};

export const firstStrikeAt = 1.6;

export const nextStrikeGap = (random: number) => 5 + random * 6;
