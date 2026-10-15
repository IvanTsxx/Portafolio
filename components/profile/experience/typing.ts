import type { LedgerEntry } from "./ledger";

export const KEY_MS = 11;
const LINE_GAP_MS = 90;
const ENTRY_GAP_MS = 120;
const STAMP_LEAD_MS = 60;
const STAMP_GAP_MS = 160;

export interface TypedLine {
  at: number;
  text: string;
}

export interface TypedStamp {
  at: number;
  label: string;
}

export interface TypedEntry {
  entry: LedgerEntry;
  lines: readonly [TypedLine, TypedLine, TypedLine];
  stamps: readonly TypedStamp[];
}

export const stampsOf = (entry: LedgerEntry) =>
  entry.bar.isOpen ? ["Current", entry.type] : [entry.type];

export const typeSchedule = (entries: readonly LedgerEntry[]): TypedEntry[] => {
  let clock = 0;
  return entries.map((entry) => {
    const typeLine = (text: string): TypedLine => {
      const line = { at: clock, text };
      clock += text.length * KEY_MS + LINE_GAP_MS;
      return line;
    };
    const company = typeLine(entry.company);
    const role = typeLine(entry.role);
    const dates = typeLine(`${entry.dates} · ${entry.length}`);
    const typedAt = clock;
    clock += ENTRY_GAP_MS;
    return {
      entry,
      lines: [company, role, dates],
      stamps: stampsOf(entry).map((label, index) => ({
        at: typedAt + STAMP_LEAD_MS + index * STAMP_GAP_MS,
        label,
      })),
    };
  });
};
