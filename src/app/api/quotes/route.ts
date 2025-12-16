// app/api/quotes/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("uuid", { ascending: true });

    if (error) {
      console.error("supabase /quotes error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("exception in /api/quotes GET:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
