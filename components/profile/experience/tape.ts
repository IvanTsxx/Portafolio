export const COLUMNS_PER_MONTH = 4;
export const TAPE_ROWS = 7;
export const SPROCKET_ROW = 3;
const DATA_ROWS = [1, 2, 4, 5, 6] as const;
const CHANNELS = DATA_ROWS.length;
const SHIMMER_MS = 240;

const bayer4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;

export interface Hole {
  column: number;
  delay: number;
  row: number;
}

export const codeOf = (character: string) =>
  /[a-z]/iu.test(character)
    ? (character.toUpperCase().codePointAt(0) ?? 64) - 64
    : 0;

export const columnCodes = (text: string, columns: number) => {
  const word = [...`${text}  `].map(codeOf);
  return Array.from(
    { length: columns },
    (_, column) => word[column % word.length] ?? 0
  );
};

export const shimmerDelay = (column: number, row: number) =>
  Math.round(((bayer4[(row % 4) * 4 + (column % 4)] ?? 0) / 16) * SHIMMER_MS);

export const holesOf = (text: string, columns: number): Hole[] =>
  columnCodes(text, columns).flatMap((code, column) =>
    DATA_ROWS.flatMap((row, channel) =>
      Math.floor(code / 2 ** (CHANNELS - 1 - channel)) % 2 === 1
        ? [{ column, delay: shimmerDelay(column, channel), row }]
        : []
    )
  );
