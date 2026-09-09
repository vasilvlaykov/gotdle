// lib/dailyIndex.ts
// Shared deterministic "pick one of N items for today" logic, used by every
// /today and /check route so they always agree on which row is today's answer.
export function getDeterministicDailyIndex(length: number, dateKey: string): number {
  if (length <= 0) return 0;
  const seed = [...dateKey].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return seed % length;
}
