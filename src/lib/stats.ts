// lib/stats.ts
import { saveToLocalStorage, loadFromLocalStorage } from "./localStorage";
import { getDailyKey } from "./dailyKey";

export type GameKey = "classic" | "quote" | "banner";

export type ModeStats = {
  played: number;
  totalGuesses: number;
};

export type GoTdleStats = {
  currentStreak: number;
  maxStreak: number;
  lastCompletedDateKey: string | null;
  classic: ModeStats;
  quote: ModeStats;
  banner: ModeStats;
};

const STATS_KEY = "gotdleStats";

function emptyModeStats(): ModeStats {
  return { played: 0, totalGuesses: 0 };
}

function defaultStats(): GoTdleStats {
  return {
    currentStreak: 0,
    maxStreak: 0,
    lastCompletedDateKey: null,
    classic: emptyModeStats(),
    quote: emptyModeStats(),
    banner: emptyModeStats(),
  };
}

export function loadStats(): GoTdleStats {
  const saved = loadFromLocalStorage<GoTdleStats>(STATS_KEY);
  if (!saved) return defaultStats();
  // Merge over defaults so a stats blob saved before a mode existed doesn't crash.
  return { ...defaultStats(), ...saved };
}

function saveStats(stats: GoTdleStats) {
  saveToLocalStorage(STATS_KEY, stats);
}

// Records a completed round for one mode. `guesses` is the number of
// guesses it took to win, including the winning guess itself.
export function recordModeWin(mode: GameKey, guesses: number): GoTdleStats {
  const stats = loadStats();
  stats[mode] = {
    played: stats[mode].played + 1,
    totalGuesses: stats[mode].totalGuesses + guesses,
  };
  saveStats(stats);
  return stats;
}

function isNextDay(prevKey: string, nextKey: string): boolean {
  const prev = new Date(`${prevKey}T00:00:00Z`).getTime();
  const next = new Date(`${nextKey}T00:00:00Z`).getTime();
  return next - prev === 24 * 60 * 60 * 1000;
}

// Call once all three modes are completed for a day. Idempotent per day —
// safe to call more than once for the same dateKey.
export function recordDayCompleted(dateKey: string = getDailyKey()): GoTdleStats {
  const stats = loadStats();

  if (stats.lastCompletedDateKey === dateKey) {
    return stats;
  }

  const streak =
    stats.lastCompletedDateKey && isNextDay(stats.lastCompletedDateKey, dateKey)
      ? stats.currentStreak + 1
      : 1;

  stats.currentStreak = streak;
  stats.maxStreak = Math.max(stats.maxStreak, streak);
  stats.lastCompletedDateKey = dateKey;

  saveStats(stats);
  return stats;
}
