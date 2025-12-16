import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { bannerUuid, guessName } = await req.json();

  if (!bannerUuid || !guessName) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const { data: banner, error } = await supabase
    .from("banners")
    .select("*")
    .eq("uuid", bannerUuid)
    .single();

  if (error || !banner) {
    return NextResponse.json(
      { error: "Banner not found" },
      { status: 404 }
    );
  }

  const correct =
    banner.house_name.trim().toLowerCase() ===
    guessName.trim().toLowerCase();

  return NextResponse.json({
    correct,
    banner,
  });
}
