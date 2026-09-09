import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Intentionally does NOT return which banner is today's answer — the uuid
// alone would be enough to look up house_name/image_url via /api/banners/all.
// The client only needs to know a puzzle exists; /api/banners/image and
// /api/banners/check compute today's target server-side.
export async function GET() {
  const { data: banners, error } = await supabase
    .from("banners")
    .select("uuid")
    .order("house_name", { ascending: true });

  if (error || !banners || banners.length === 0) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data: { available: true } });
}
