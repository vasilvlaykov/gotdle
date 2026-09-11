// lib/confetti.ts
import confetti from "canvas-confetti";

const FIRE_COLORS = ["#FF4500", "#FF8C00", "#FFD700"];
const ICE_COLORS = ["#00BFFF", "#B0E0E6", "#FFFFFF"];

const FIRE_ORIGIN = { x: 0.2, y: 0.7 };
const ICE_ORIGIN = { x: 0.8, y: 0.7 };

let dragonShape: unknown = null;
let wolfShape: unknown = null;

// Shapes require OffscreenCanvas, so they're only ever built lazily inside a
// client interaction — never at module scope, which Next.js also evaluates
// during server-side prerendering where OffscreenCanvas doesn't exist.
function getDragonShape() {
  if (typeof window === "undefined") return null;
  if (!dragonShape) {
    dragonShape = confetti.shapeFromText({ text: "🐉", scalar: 3.5 });
  }
  return dragonShape;
}

function getWolfShape() {
  if (typeof window === "undefined") return null;
  if (!wolfShape) {
    wolfShape = confetti.shapeFromText({ text: "🐺", scalar: 3 });
  }
  return wolfShape;
}

// A Game of Thrones-themed win celebration: mirrored fire (left) and ice
// (right) bursts converging toward the center, plus a light sprinkle of
// larger dragon/direwolf particles on their respective sides.
export function launchGoTConfetti() {
  if (typeof window === "undefined") return;

  const shared = {
    startVelocity: 45,
    gravity: 0.65,
    decay: 0.91,
    spread: 65,
    ticks: 200,
  };

  confetti({
    ...shared,
    particleCount: 110,
    angle: 60,
    origin: FIRE_ORIGIN,
    colors: FIRE_COLORS,
    shapes: ["circle", "square"],
    scalar: 0.9,
  });

  confetti({
    ...shared,
    particleCount: 110,
    angle: 120,
    origin: ICE_ORIGIN,
    colors: ICE_COLORS,
    shapes: ["circle", "square"],
    scalar: 0.9,
  });

  const dragon = getDragonShape();
  const wolf = getWolfShape();

  if (dragon) {
    confetti({
      ...shared,
      particleCount: 5,
      angle: 65,
      spread: 45,
      startVelocity: 35,
      gravity: 0.5,
      origin: FIRE_ORIGIN,
      shapes: [dragon],
      // Match shapeFromText's scalar so the glyph bitmap was rendered at
      // this resolution — keeps it crisp instead of upscaling a blurry one.
      scalar: 3.5,
    });
  }

  if (wolf) {
    confetti({
      ...shared,
      particleCount: 5,
      angle: 115,
      spread: 45,
      startVelocity: 35,
      gravity: 0.5,
      origin: ICE_ORIGIN,
      shapes: [wolf],
      scalar: 3,
    });
  }
}
