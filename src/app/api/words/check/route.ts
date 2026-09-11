import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getDailyKey } from "@/lib/dailyKey";
import { getDeterministicDailyIndex } from "@/lib/dailyIndex";

export async function POST(req: Request) {
  const { guessUuid } = await req.json();

  if (!guessUuid) {
    return NextResponse.json({ error: "Missing guessUuid" }, { status: 400 });
  }

  const { data: banners, error } = await supabase
    .from("banners")
    .select("uuid")
    .not("words", "is", null)
    .order("house_name", { ascending: true });

  if (error || !banners || banners.length === 0) {
    return NextResponse.json({ error: "Failed to load banners" }, { status: 500 });
  }

  const index = getDeterministicDailyIndex(banners.length, `${getDailyKey()}-words`);
  const target = banners[index];

  return NextResponse.json({ correct: guessUuid === target.uuid });
}
