// lib/dailyKey.ts
export function getDailyKey() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}
