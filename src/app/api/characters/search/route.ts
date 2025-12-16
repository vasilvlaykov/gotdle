import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q.length < 1) {
    return NextResponse.json({ data: [] });
  }

  const { data, error } = await supabase
    .from("characters")
    .select("uuid, name, image_url")
    .ilike("name", `%${q}%`)
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
