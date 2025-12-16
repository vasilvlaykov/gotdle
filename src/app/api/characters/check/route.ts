import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function safeParseAffiliations(affs: any): string[] {
  if (Array.isArray(affs)) return affs;
  if (typeof affs === "string") {
    try {
      const parsed = JSON.parse(affs);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return affs.split(",").map((s) => s.trim());
    }
  }
  return [];
}

function compareField(todayVal: string, guessVal: string): string {
  if (todayVal === guessVal) return "green";
  return "red";
}

function compareAffiliations(todayAffs: string[], guessAffs: string[]): string {
  const todaySet = new Set(todayAffs);
  const guessSet = new Set(guessAffs);

  if (todaySet.size === 0 && guessSet.size === 0) return "green";
  if (todaySet.size === 0 || guessSet.size === 0) return "red";

  const intersection = new Set([...guessSet].filter(x => todaySet.has(x)));

  if (intersection.size === todaySet.size && intersection.size === guessSet.size) {
    return "green";
  } else if (intersection.size > 0) {
    return "yellow";
  } else {
    return "red";
  }
}

export async function POST(request: Request) {
  try {
    const { guessUuid } = await request.json();

    const { data: characters, error } = await supabase
      .from("characters")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!characters || characters.length === 0) {
      return NextResponse.json({ error: "No characters found" }, { status: 500 });
    }

    const day = new Date().getDate();
    const today = characters[day % characters.length];
    const guess = characters.find((c) => c.uuid === guessUuid);

    if (!guess) {
      return NextResponse.json({ error: "Guess character not found" }, { status: 400 });
    }

    const todayAffiliations = safeParseAffiliations(today.affiliations);
    const guessAffiliations = safeParseAffiliations(guess.affiliations);

    const hints = {
      gender: compareField(today.gender, guess.gender),
      status: compareField(today.status, guess.status),
      region: compareField(today.region, guess.region),
      affiliations: compareAffiliations(todayAffiliations, guessAffiliations),
    };

    const correct = guess.uuid === today.uuid;

    return NextResponse.json({
      correct,
      hints,
      guess,
      today: correct ? today : null,
    });
  } catch (err) {
    console.error("Exception in /api/characters/check route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
