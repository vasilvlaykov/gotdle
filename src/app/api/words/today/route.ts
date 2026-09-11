import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getDailyKey } from "@/lib/dailyKey";
import { getDeterministicDailyIndex } from "@/lib/dailyIndex";

// Only the motto text is returned — never the house identity, which would
// let the client cross-reference /api/banners/all to solve instantly.
// /api/words/check recomputes today's target server-side. Seeded with a
// salted date key so this mode's daily pick doesn't always match Banner
// mode's pick for the same house.
export async function GET() {
  const { data: banners, error } = await supabase
    .from("banners")
    .select("words")
    .not("words", "is", null)
    .order("house_name", { ascending: true });

  if (error || !banners || banners.length === 0) {
    return NextResponse.json({ data: null });
  }

  const index = getDeterministicDailyIndex(banners.length, `${getDailyKey()}-words`);
  const target = banners[index];

  return NextResponse.json({ data: { words: target.words } });
}
