import { ImageResponse } from "next/og";

const MODE_META: Record<string, { emoji: string; label: string }> = {
  classic: { emoji: "🏰", label: "Classic" },
  quote: { emoji: "🗨️", label: "Quote" },
  banner: { emoji: "🛡️", label: "Banner" },
  words: { emoji: "📜", label: "Words" },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "classic";

  let emoji: string;
  let heading: string;

  if (mode === "streak") {
    const days = Math.max(1, parseInt(searchParams.get("days") ?? "1", 10) || 1);
    emoji = "🔥";
    heading = `${days} Day Streak!`;
  } else {
    const meta = MODE_META[mode] ?? MODE_META.classic;
    const guesses = Math.max(1, parseInt(searchParams.get("g") ?? "1", 10) || 1);
    emoji = meta.emoji;
    heading = `${meta.label}: Solved in ${guesses}!`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#14181d",
          backgroundImage:
            "linear-gradient(135deg, #1b2530 0%, #14181d 45%, #241a14 100%)",
          color: "#F3E7C9",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: "#C1A753",
            letterSpacing: 6,
          }}
        >
          GOTDLE
        </div>
        <div style={{ display: "flex", fontSize: 160, marginTop: 16 }}>{emoji}</div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, marginTop: 8 }}>
          {heading}
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 32, opacity: 0.75 }}>
          Play today&apos;s puzzle at gotdle.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
