// lib/confetti.ts
import confetti from "canvas-confetti";

const FIRE_ORIGIN = { x: 0.2, y: 0.7 };
const ICE_ORIGIN = { x: 0.8, y: 0.7 };
const CENTER_ORIGIN = { x: 0.5, y: 0.75 };

const FIRE_EMOJI = "🔥";
const ICE_EMOJI = "❄️";
const DRAGON_EMOJI = "🐉";
const WOLF_EMOJI = "🐺";
const SWORDS_EMOJI = "⚔️";

const shapeCache = new Map<string, unknown>();

// Shapes require OffscreenCanvas, so they're only ever built lazily inside a
// client interaction — never at module scope, which Next.js also evaluates
// during server-side prerendering where OffscreenCanvas doesn't exist.
function getEmojiShape(emoji: string, scalar: number) {
  if (typeof window === "undefined") return null;

  const key = `${emoji}:${scalar}`;
  if (!shapeCache.has(key)) {
    shapeCache.set(key, confetti.shapeFromText({ text: emoji, scalar }));
  }
  return shapeCache.get(key);
}

// A Game of Thrones-themed win celebration, built entirely from emoji
// particles: mirrored fire (left) and ice (right) bursts converging toward
// center — echoing the dragon-vs-throne art on every page — with a sprinkle
// of larger dragon/direwolf accents on their respective sides, and crossed
// swords rising from the middle where the two sides meet.
export function launchGoTConfetti() {
  if (typeof window === "undefined") return;

  const shared = {
    startVelocity: 45,
    gravity: 0.65,
    decay: 0.91,
    spread: 65,
    ticks: 350,
    scalar: 4,
  };

  const fire = getEmojiShape(FIRE_EMOJI, 1.8);
  const ice = getEmojiShape(ICE_EMOJI, 1.8);
  const dragon = getEmojiShape(DRAGON_EMOJI, 3.5);
  const wolf = getEmojiShape(WOLF_EMOJI, 3);
  const swords = getEmojiShape(SWORDS_EMOJI, 2.2);

  if (fire) {
    confetti({
      ...shared,
      particleCount: 80,
      angle: 60,
      origin: FIRE_ORIGIN,
      shapes: [fire],
    });
  }

  if (ice) {
    confetti({
      ...shared,
      particleCount: 80,
      angle: 120,
      origin: ICE_ORIGIN,
      shapes: [ice],
    });
  }

  if (dragon) {
    confetti({
      ...shared,
      particleCount: 80,
      angle: 65,
      spread: 45,
      startVelocity: 35,
      gravity: 0.5,
      origin: FIRE_ORIGIN,
      shapes: [dragon],
      // Match shapeFromText's scalar so the glyph bitmap was rendered at
      // this resolution — keeps it crisp instead of upscaling a blurry one.
    });
  }

  if (wolf) {
    confetti({
      ...shared,
      particleCount: 80,
      angle: 115,
      spread: 45,
      startVelocity: 35,
      gravity: 0.5,
      origin: ICE_ORIGIN,
      shapes: [wolf],
    });
  }

  if (swords) {
    confetti({
      ...shared,
      particleCount: 80,
      angle: 90,
      spread: 100,
      startVelocity: 40,
      gravity: 0.55,
      origin: CENTER_ORIGIN,
      shapes: [swords],
    });
  }
}
