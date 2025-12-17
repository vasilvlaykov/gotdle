"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import GameCard from "./components/GameCard";
import useGameProgress from "@/hooks/useGameProgress";
import CountdownTimer from "./components/CountdownTimer";
import DisclaimerTooltip from "./components/DisclaimerTooltip";

export default function HomePage() {
  const { state } = useGameProgress();

  const [hasHydrated, setHasHydrated] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false); // prevent repeated scrolling

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const allCompleted =
    state.classicDone && state.quoteDone && state.bannerDone;

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
    </main>
  );
}
