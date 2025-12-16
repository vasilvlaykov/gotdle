import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {

  // deterministic daily index
  const today = new Date().toISOString().slice(0, 10);
  const seed = [...today].reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("house_name", { ascending: true });

  if (!banners || banners.length === 0) {
    return NextResponse.json({ data: null });
  }

  const index = seed % banners.length;
  const daily = banners[index];

  return NextResponse.json({ data: daily });
}
