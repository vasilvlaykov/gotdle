import { ImageResponse } from "next/og";

// Matches the /assets/{icon}-icon.png convention used by the home page's
// GameCard, so the share card reuses the exact same mode icons.
const MODE_META: Record<string, { icon: string; label: string }> = {
  classic: { icon: "throne", label: "Classic" },
  quote: { icon: "quotes", label: "Quote" },
  banner: { icon: "banner", label: "Banner" },
  words: { icon: "words", label: "Words" },
};

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "classic";

  let iconUrl: string | null = null;
  let heading: string;

  if (mode === "streak") {
    const days = Math.max(1, parseInt(searchParams.get("days") ?? "1", 10) || 1);
    heading = `${days} Day Streak!`;
  } else {
    const meta = MODE_META[mode] ?? MODE_META.classic;
    const guesses = Math.max(1, parseInt(searchParams.get("g") ?? "1", 10) || 1);
    iconUrl = `${origin}/assets/${meta.icon}-icon.png`;
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
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) needs a plain <img>, not next/image
          <img
            src={iconUrl}
            width={180}
            height={180}
            alt=""
            style={{ display: "flex", marginTop: 16 }}
          />
        ) : (
          <div style={{ display: "flex", fontSize: 160, marginTop: 16 }}>🔥</div>
        )}
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
