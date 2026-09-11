// lib/confetti.ts
//
// canvas-confetti's only rotation control is the binary `flat` option (full
// tumbling 3D-style flip, or completely static/no rotation) — there's no way
// to dial in a gentle rotate. So this renders emoji particles as plain DOM
// nodes animated with the Web Animations API instead, which gives full
// control over a subtle rotate-while-falling motion with no flip.

type Origin = { xPct: number; yPct: number };

const FIRE_ORIGIN: Origin = { xPct: 20, yPct: 70 };
const ICE_ORIGIN: Origin = { xPct: 80, yPct: 70 };
const CENTER_ORIGIN: Origin = { xPct: 50, yPct: 75 };

const FIRE_EMOJI = "🔥";
const ICE_EMOJI = "❄️";
const DRAGON_EMOJI = "🐉";
const WOLF_EMOJI = "🐺";
const SWORDS_EMOJI = "⚔️";

const OVERLAY_ID = "gotdle-confetti-overlay";

function getOverlay(): HTMLElement {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) return existing;

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "9999";
  overlay.style.overflow = "hidden";
  document.body.appendChild(overlay);
  return overlay;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type BurstOptions = {
  emoji: string;
  origin: Origin;
  count: number;
  // Degrees from straight up; negative leans left, positive leans right.
  angleRange: [number, number];
  distanceRange: [number, number]; // px traveled during the initial "shot"
  sizeRange: [number, number]; // px font-size
};

function burst(container: HTMLElement, opts: BurstOptions) {
  const vh = window.innerHeight;

  for (let i = 0; i < opts.count; i++) {
    const angleDeg = randomBetween(opts.angleRange[0], opts.angleRange[1]);
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const shotDistance = randomBetween(opts.distanceRange[0], opts.distanceRange[1]);

    const midX = Math.cos(angleRad) * shotDistance;
    const midY = Math.sin(angleRad) * shotDistance;

    const fallDistance = randomBetween(vh * 0.5, vh * 0.9);
    const driftX = randomBetween(-40, 40);

    // Small, one-directional sway — never a full flip.
    const rotateMid = randomBetween(-18, 18);
    const rotateEnd = rotateMid + randomBetween(-18, 18);

    const size = randomBetween(opts.sizeRange[0], opts.sizeRange[1]);
    const duration = randomBetween(1800, 2600);
    const delay = randomBetween(0, 150);

    const el = document.createElement("span");
    el.textContent = opts.emoji;
    el.setAttribute("aria-hidden", "true");
    el.style.position = "absolute";
    el.style.left = `${opts.origin.xPct}%`;
    el.style.top = `${opts.origin.yPct}%`;
    el.style.fontSize = `${size}px`;
    el.style.lineHeight = "1";
    el.style.willChange = "transform, opacity";

    container.appendChild(el);

    const animation = el.animate(
      [
        { transform: "translate(-50%, -50%) translate(0px, 0px) rotate(0deg)", opacity: 1, offset: 0 },
        {
          transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px) rotate(${rotateMid}deg)`,
          opacity: 1,
          offset: 0.35,
        },
        {
          transform: `translate(-50%, -50%) translate(${midX + driftX}px, ${midY + fallDistance}px) rotate(${rotateEnd}deg)`,
          opacity: 0,
          offset: 1,
        },
      ],
      {
        duration,
        delay,
        easing: "cubic-bezier(0.25, 0.65, 0.4, 1)",
        fill: "forwards",
      }
    );

    animation.onfinish = () => el.remove();
  }
}

// A Game of Thrones-themed win celebration, built entirely from emoji
// particles: mirrored fire (left) and ice (right) bursts arcing toward
// center — echoing the dragon-vs-throne art on every page — with dragon and
// direwolf accents on their respective sides, and crossed swords rising
// from the middle where the two sides meet. Every particle drifts down with
// a slight rotational sway, never a flip.
export function launchGoTConfetti() {
  if (typeof window === "undefined") return;

  const container = getOverlay();

  burst(container, {
    emoji: FIRE_EMOJI,
    origin: FIRE_ORIGIN,
    count: 100,
    angleRange: [-20, 40],
    distanceRange: [60, 200],
    sizeRange: [26, 40],
  });

  burst(container, {
    emoji: ICE_EMOJI,
    origin: ICE_ORIGIN,
    count: 100,
    angleRange: [-40, 20],
    distanceRange: [60, 200],
    sizeRange: [26, 40],
  });

  burst(container, {
    emoji: DRAGON_EMOJI,
    origin: FIRE_ORIGIN,
    count: 24,
    angleRange: [-15, 35],
    distanceRange: [80, 220],
    sizeRange: [32, 40],
  });

  burst(container, {
    emoji: WOLF_EMOJI,
    origin: ICE_ORIGIN,
    count: 24,
    angleRange: [-35, 15],
    distanceRange: [80, 220],
    sizeRange: [32, 40],
  });

  burst(container, {
    emoji: SWORDS_EMOJI,
    origin: CENTER_ORIGIN,
    count: 26,
    angleRange: [-60, 60],
    distanceRange: [70, 190],
    sizeRange: [28, 40],
  });
}
