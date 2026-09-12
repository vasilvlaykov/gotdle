// lib/shareText.ts
import { getDailyKey } from "./dailyKey";

export const SITE_URL = "https://www.gotdle.com";

const HINT_EMOJI: Record<string, string> = {
  green: "🟩",
  yellow: "🟨",
  red: "🟥",
};

export type ShareMode = "classic" | "quote" | "banner" | "words" | "streak";

// Builds a link to the public /share result page, which carries its own
// Open Graph image (see /api/og) so the link unfurls into a branded card on
// X/Discord/iMessage/WhatsApp instead of a bare URL, and gives whoever
// clicks it a "play now" path back into the game.
export function buildShareUrl(mode: ShareMode, value: number): string {
  const params = new URLSearchParams({ mode });
  params.set(mode === "streak" ? "days" : "g", String(value));
  return `${SITE_URL}/share?${params.toString()}`;
}

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

  return [`GoTdle Classic ${date} ${hintsPerGuess.length}/∞`, "", ...rows].join("\n");
}

// Quote/Banner/Words modes: no per-attribute hints, just wrong guesses (🟥)
// then the winning guess (🟩).
export function buildSimpleShareText(
  mode: "Quote" | "Banner" | "Words",
  guessCount: number
): string {
  const date = getDailyKey();
  const row = HINT_EMOJI.red.repeat(Math.max(0, guessCount - 1)) + HINT_EMOJI.green;

  return [`GoTdle ${mode} ${date} ${guessCount}/∞`, "", row].join("\n");
}
