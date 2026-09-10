// lib/shareText.ts
import { getDailyKey } from "./dailyKey";

const SITE_URL = "https://www.gotdle.com";

const HINT_EMOJI: Record<string, string> = {
  green: "🟩",
  yellow: "🟨",
  red: "🟥",
};

// Classic mode: one row per guess, oldest guess first, columns matching the
// on-screen order (Status, Gender, Region, Affiliations).
export function buildClassicShareText(
  hintsPerGuess: { status: string; gender: string; region: string; affiliations: string }[]
): string {
  const date = getDailyKey();
  const rows = hintsPerGuess
    .slice()
    .reverse()
    .map((h) =>
      [h.status, h.gender, h.region, h.affiliations]
        .map((c) => HINT_EMOJI[c] ?? "⬜")
        .join("")
    );

  return [
    `GoTdle Classic ${date} ${hintsPerGuess.length}/∞`,
    "",
    ...rows,
    "",
    SITE_URL,
  ].join("\n");
}

// Quote/Banner modes: no per-attribute hints, just wrong guesses (🟥) then
// the winning guess (🟩).
export function buildSimpleShareText(mode: "Quote" | "Banner", guessCount: number): string {
  const date = getDailyKey();
  const row = HINT_EMOJI.red.repeat(Math.max(0, guessCount - 1)) + HINT_EMOJI.green;

  return [`GoTdle ${mode} ${date} ${guessCount}/∞`, "", row, "", SITE_URL].join("\n");
}
