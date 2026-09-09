import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabase } from "@/lib/supabase";
import { getDailyKey } from "@/lib/dailyKey";
import { getDeterministicDailyIndex } from "@/lib/dailyIndex";

const MAX_BLUR = 10;

// Serves today's banner image pre-blurred server-side, so the unblurred
// source is never sent to the client until the puzzle is solved (or the
// blur hint reaches 0 after enough wrong guesses).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wrong = Math.max(0, parseInt(searchParams.get("wrong") || "0", 10) || 0);
  const revealed = searchParams.get("revealed") === "1";

  const { data: banners, error } = await supabase
    .from("banners")
    .select("uuid, image_url")
    .order("house_name", { ascending: true });

  if (error || !banners || banners.length === 0) {
    return NextResponse.json({ error: "Failed to load banners" }, { status: 500 });
  }

  const index = getDeterministicDailyIndex(banners.length, getDailyKey());
  const target = banners[index];

  const sourceRes = await fetch(target.image_url);
  if (!sourceRes.ok) {
    return NextResponse.json({ error: "Failed to load banner image" }, { status: 502 });
  }
  const sourceBuffer = Buffer.from(await sourceRes.arrayBuffer());

  const sigma = revealed ? 0 : Math.max(0, MAX_BLUR - (wrong * MAX_BLUR) / 5);

  let pipeline = sharp(sourceBuffer, { density: 300 }).resize(480, 480, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (sigma >= 0.3) {
    pipeline = pipeline.blur(sigma);
  }

  const output = await pipeline.png().toBuffer();

  return new NextResponse(new Uint8Array(output), {
    headers: {
      "Content-Type": "image/png",
      // Safe to cache per (day, wrong-count) — never varies for a given viewer's progress.
      "Cache-Control": "private, max-age=300",
    },
  });
}
