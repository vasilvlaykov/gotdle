import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("house_name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load banners" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
