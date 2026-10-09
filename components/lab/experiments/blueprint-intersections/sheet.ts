export const sheetColumns = [..."ABCDEFGHIJKL"];
export const sheetRows = Array.from({ length: 8 }, (_, rowIndex) =>
  (rowIndex + 1).toString().padStart(2, "0")
);
export const compactColumnCount = 8;

export const coordinate = (column: string, row: string) => `${column}·${row}`;
