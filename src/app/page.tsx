"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import GameCard from "./components/GameCard";
import useGameProgress from "@/hooks/useGameProgress";
import CountdownTimer from "./components/CountdownTimer";
import DisclaimerTooltip from "./components/DisclaimerTooltip";
import StatsModal from "./components/StatsModal";
import { loadStats, type GoTdleStats } from "@/lib/stats";

export default function HomePage() {
  const { state } = useGameProgress();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [stats, setStats] = useState<GoTdleStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false); // prevent repeated scrolling

  useEffect(() => {
    setHasHydrated(true);
    setStats(loadStats());
  }, []);

  const allCompleted =
    state.classicDone && state.quoteDone && state.bannerDone && state.wordsDone;

  // Smooth scroll to banner once it appears
  useEffect(() => {
    if (
      hasHydrated &&
      allCompleted &&
      bannerRef.current &&
      !hasScrolledRef.current
    ) {
      hasScrolledRef.current = true;
      bannerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [hasHydrated, allCompleted]);

  return (
    <main style={{ padding: "0 2rem", maxWidth: 500, margin: "auto" }}>
      {hasHydrated && stats && (
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => setShowStats(true)}
            className="streak-badge flex items-center gap-2 px-4 py-2 rounded-full got-font text-white bg-black/70 cursor-pointer"
          >
            <span className="flame-icon text-xl">🔥</span>
            <span className="text-lg font-bold leading-none">{stats.currentStreak}</span>
            <span className="text-sm opacity-80">day streak</span>
          </button>
        </div>
      )}

      <section style={{ display: "grid", gap: "1rem" }} className="got-font">
        <Link href="/classic" passHref>
          <GameCard
            title="Classic"
            description="Get clues on every try"
            icon="throne"
          />
        </Link>
        <Link href="/quote" passHref>
          <GameCard
            title="Quote"
            description="Guess who said that quote"
            icon="quotes"
          />
        </Link>
        <Link href="/banner" passHref>
          <GameCard
            title="Banner"
            description="Guess the house banner"
            icon="banner"
          />
        </Link>
        <Link href="/words" passHref>
          <GameCard
            title="Words"
            description="Guess the house from its words"
            emojiIcon="📜"
          />
        </Link>
      </section>

      {/* Congratulation banner */}
      {hasHydrated && allCompleted && (
        <div ref={bannerRef} className="mt-8 relative flex justify-center congrats-banner">
          <Image
            src="/assets/blackbanner.png"
            alt="Congratulations"
            width={500}
            height={500}
            priority
            className="congrats-banner-img"
          />

          <CountdownTimer classList="absolute text-center top-1/2 countdown" />
        </div>
      )}
      <div className="absolute top-4 right-4 z-50">
        <DisclaimerTooltip />
      </div>

      {showStats && stats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}
    </main>
  );
}
