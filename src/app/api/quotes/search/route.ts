// app/api/characters/search/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 1) {
    return NextResponse.json({ data: [] });
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .ilike("name", `%${q}%`)
    .limit(20);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
