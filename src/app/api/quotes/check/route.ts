// app/api/quotes/check/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteUuid, guessUuid } = body || {};

    if (!quoteUuid || !guessUuid) {
      return NextResponse.json(
        { error: "quoteUuid and guessUuid are required" },
        { status: 400 }
      );
    }

    // fetch quote
    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .select("*")
      .eq("uuid", quoteUuid)
      .single();

    if (qErr || !quote) {
      console.error("quotes lookup error:", qErr);
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // fetch guessed character
    const { data: guess, error: gErr } = await supabase
      .from("characters")
      .select("*")
      .eq("uuid", guessUuid)
      .single();

    if (gErr || !guess) {
      console.error("characters lookup error:", gErr);
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const correct = String(quote.author_id) === String(guessUuid);

    return NextResponse.json({
      correct,
      guess,
      message: correct ? "Correct!" : "Wrong!",
    });
  } catch (err) {
    console.error("exception in /api/quotes/check POST:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
