import { supabase } from "@/lib/supabase";

export async function GET() {
  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const { data: characters, error } = await supabase
    .from("characters")
    .select("*");

  if (error) return Response.json({ error });

  const index = dayNumber % characters.length;
  const today = characters[index];

  return Response.json({ data: today });
}
