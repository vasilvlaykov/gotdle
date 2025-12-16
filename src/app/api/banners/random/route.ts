import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("uuid", { ascending: false });

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to load banners" },
      { status: 500 }
    );
  }

  const random = data[Math.floor(Math.random() * data.length)];

  return NextResponse.json({ data: random });
}
