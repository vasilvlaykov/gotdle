import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: quotes, error } = await supabase
      .from("quotes")
      .select("uuid, quote, recipient_id, recipient_image_url")
      .order("uuid", { ascending: true });

    if (error) {
      console.error("supabase /quotes error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ data: null });
    }

    // author_id / author_image_url are the answer to "who said this quote" —
    // deliberately excluded here. /api/quotes/check verifies guesses server-side.
    const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const index = dayNumber % quotes.length;
    const today = quotes[index];

    return NextResponse.json({ data: today });
  } catch (err) {
    console.error("exception in /api/quotes/today GET:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
