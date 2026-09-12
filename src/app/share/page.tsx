import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_URL } from "@/lib/shareText";

type ShareParams = { mode?: string; g?: string; days?: string };

// `icon` matches the /assets/{icon}-icon.png convention used by the home
// page's GameCard, so the share page reuses the exact same mode icons.
// `emoji` is kept for text-only contexts (the <title> tag, notification
// previews) where an image can't be embedded.
const MODE_META: Record<string, { emoji: string; icon: string; label: string }> = {
  classic: { emoji: "🏰", icon: "throne", label: "Classic" },
  quote: { emoji: "🗨️", icon: "quotes", label: "Quote" },
  banner: { emoji: "🛡️", icon: "banner", label: "Banner" },
  words: { emoji: "📜", icon: "words", label: "Words" },
};

function describeResult(params: ShareParams) {
  const mode = params.mode ?? "classic";

  if (mode === "streak") {
    const days = Math.max(1, parseInt(params.days ?? "1", 10) || 1);
    return {
      title: `🔥 ${days} Day GoTdle Streak!`,
      heading: `${days} Day Streak!`,
      description: `I'm on a ${days} day GoTdle streak. Can you beat it?`,
      icon: null as string | null,
    };
  }

  const meta = MODE_META[mode] ?? MODE_META.classic;
  const guesses = Math.max(1, parseInt(params.g ?? "1", 10) || 1);
  return {
    title: `${meta.emoji} GoTdle ${meta.label}: Solved in ${guesses}!`,
    heading: `${meta.label}: Solved in ${guesses}!`,
    description: `I solved today's GoTdle ${meta.label} puzzle in ${guesses} guesses. Think you can beat me?`,
    icon: meta.icon,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ShareParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { title, description } = describeResult(params);

  const ogParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  );
  const ogImageUrl = `${SITE_URL}/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/share`,
      siteName: "GoTdle",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<ShareParams>;
}) {
  const params = await searchParams;
  const { heading, description, icon } = describeResult(params);

  return (
    <main style={{ padding: "0 2rem", maxWidth: 500, margin: "auto" }}>
      <div className="game-box rounded-2xl p-6 mt-8 got-font text-white text-center">
        {icon ? (
          <Image
            src={`/assets/${icon}-icon.png`}
            alt=""
            width={80}
            height={80}
            className="mx-auto mb-3"
          />
        ) : (
          <span className="flame-icon text-6xl block mb-3">🔥</span>
        )}
        <h1 className="text-2xl font-bold mb-3">{heading}</h1>
        <p className="mb-6 opacity-80">{description}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded next-game-btn font-semibold"
        >
          Play Today&apos;s Puzzle →
        </Link>
      </div>
    </main>
  );
}
