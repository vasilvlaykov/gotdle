"use client";

import React, { useState, useEffect, useRef } from "react";
import AutoShrinkText from "../components/AutoShrinkText";
import FlipHint from "../components/FlipHint";
import WinMessage from "../components/WinMessage";
import CountdownTimer from "../components/CountdownTimer";
import { sortSuggestions } from "@/utils/sortSuggestions";
import { launchGoTConfetti } from "@/lib/confetti";
import useGameProgress from "@/hooks/useGameProgress";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "@/lib/localStorage";

import { getDailyKey } from "@/lib/dailyKey"; // <-- import dailyKey helper
import { buildClassicShareText, buildShareUrl } from "@/lib/shareText";

type Character = {
  uuid: string;
  name: string;
  image_url: string;
  gender: string;
  status: string;
  region: string;
  affiliations: any;
};

type GuessResult = {
  correct: boolean;
  hints: {
    status: string;
    gender: string;
    region: string;
    affiliations: string;
  };
  guess: Character;
  today?: Character | null;
};


export default function ClassicGame() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Character[]>([]);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  // Guesses made live during this page visit — only these play the flip
  // animation. Guesses restored from localStorage on load render already
  // revealed, no animation.
  const [liveGuessUuids, setLiveGuessUuids] = useState<Set<string>>(new Set());
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const winMessageRef = useRef<HTMLDivElement>(null);

  const { markCompleted } = useGameProgress();

  const dailyKey = getDailyKey();
  const STORAGE_KEY = `classicGameState_${dailyKey}`; // key scoped by day

  // Load characters and saved state together
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/characters/all");
        if (!res.ok) {
          console.error("API error:", res.status);
          setIsLoading(false);
          return;
        }
        const { data } = await res.json();
        setCharacters(data || []);

        const saved = loadFromLocalStorage<{ guesses: GuessResult[]; showWinMessage: boolean; dailyKey?: string }>(STORAGE_KEY);

        if (saved) {
          if (saved.guesses) setGuesses(saved.guesses);
          if (saved.showWinMessage) setShowWinMessage(saved.showWinMessage);
        }
      } catch (err) {
        console.error("Failed to load characters:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [STORAGE_KEY]);

  // Save state on guesses or win message change
  useEffect(() => {
    if (isLoading) return;
    saveToLocalStorage(STORAGE_KEY, { guesses, showWinMessage });
  }, [guesses, showWinMessage, isLoading, STORAGE_KEY]);

  useEffect(() => {
    if (!query.trim() || showWinMessage) {
      setSuggestions([]);
      return;
    }

    const guessedUuids = new Set(guesses.map((g) => g.guess.uuid));
    const filtered = characters.filter((c) => !guessedUuids.has(c.uuid));

    const sorted = sortSuggestions(filtered, query, (item) => item.name);

    setSuggestions(sorted.slice(0, 10));
  }, [query, characters, guesses, showWinMessage]);

  function formatAffiliations(aff: any): string {
    if (!aff && aff !== 0) return "None";

    if (Array.isArray(aff)) return aff.join(", ");

    if (typeof aff === "string") {
      const trimmed = aff.trim();

      if (!trimmed.startsWith("[") && trimmed.includes(",")) {
        return trimmed;
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch {
        const cleaned = trimmed.replace(/^\[|\]$/g, "").replace(/(^"|"$)/g, "");
        if (!cleaned) return "None";
        return cleaned;
      }
    }

    try {
      return String(aff);
    } catch {
      return "None";
    }
  }

  async function handleGuess(character: Character) {
    setQuery("");
    setSuggestions([]);

    try {
      const res = await fetch("/api/characters/check", {
        method: "POST",
        body: JSON.stringify({ guessUuid: character.uuid }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Guess check failed:", res.status);
        return;
      }

      const result: GuessResult = await res.json();
      setLiveGuessUuids((prev) => new Set(prev).add(result.guess.uuid));
      setGuesses((prev) => [result, ...prev]);

      if (result.correct) {
        markCompleted("classic", guesses.length + 1);

        setTimeout(() => {
          setShowWinMessage(true);
          launchGoTConfetti();
        }, 1200);
      }
    } catch (err) {
      console.error("Guess check error:", err);
    }
  }

  function renderHint(text: string, colorClass: string, delay: number, animate: boolean) {
    const cls = colorClass || "red";
    return (
      <FlipHint
        colorClass={cls}
        text={
          <AutoShrinkText maxFontSize={20} minFontSize={10}>
            {text}
          </AutoShrinkText>
        }
        delay={delay}
        animate={animate}
      />
    );
  }

  // Scroll to win message when it's shown
  useEffect(() => {
    if (showWinMessage) {
      setTimeout(() => {
        winMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [showWinMessage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-5xl text-white text-center got-font font-bold mb-4">
          Winter is loading...
        </h1>{" "}
        <div className="w-12 h-12 border-6 border-white/30 border-t-white rounded-full animate-spin text-center"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 relative game-box rounded-2xl">
      <h1 className="text-3xl font-bold mb-4 text-center got-font">
        Guess today's character
      </h1>

      {!showWinMessage && (
        <>
          <h3 className="text-sm got-font font-bold mb-4 text-center">
            Type any character to begin.
          </h3>

          <input
            type="text"
            placeholder="Type a character name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            autoComplete="off"
          />

          {suggestions.length > 0 && (
            <div className="border rounded bg-black shadow max-h-64 overflow-y-auto absolute z-20 w-full">
              {suggestions.map((char) => (
                <div
                  key={char.uuid}
                  onClick={() => handleGuess(char)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer text-xl font-bold"
                >
                  <img
                    src={char.image_url}
                    alt={char.name}
                    className="w-15 h-15 rounded object-cover"
                  />
                  <span>{char.name}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {guesses.length > 0 && (
        <div>
          <div className="mt-4 w-full overflow-x-auto">
            <div className="min-w-[520px] mx-auto">
            <div className="grid grid-cols-[100px_repeat(4,100px)] gap-2 select-none font-semibold text-center mb-2">
              <div className="h-[40px] flex items-center justify-center char-guess-header">
                Character
              </div>
              <div className="h-[40px] flex items-center justify-center char-guess-header">
                Status
              </div>
              <div className="h-[40px] flex items-center justify-center char-guess-header">
                Gender
              </div>
              <div className="h-[40px] flex items-center justify-center char-guess-header">
                Region
              </div>
              <div className="h-[40px] flex items-center justify-center char-guess-header">
                Affiliations
              </div>
            </div>

            {guesses.map((g) => {
              const baseDelay = 0;
              const animate = liveGuessUuids.has(g.guess.uuid);

              return (
                <div
                  key={g.guess.uuid}
                  className="grid grid-cols-[100px_repeat(4,100px)] gap-2 items-center mb-3"
                >
                  <div className="w-[100px] h-[100px] flex items-center justify-center">
                    <img
                      src={g.guess.image_url}
                      alt={g.guess.name}
                      className="w-[100px] h-[100px] object-cover character-hint-img"
                    />
                  </div>

                  {renderHint(g.guess.status ?? "Unknown", g.hints.status, baseDelay + 0, animate)}
                  {renderHint(g.guess.gender ?? "Unknown", g.hints.gender, baseDelay + 300, animate)}
                  {renderHint(g.guess.region ?? "Unknown", g.hints.region, baseDelay + 600, animate)}
                  {renderHint(
                    formatAffiliations(g.guess.affiliations),
                    g.hints.affiliations,
                    baseDelay + 900,
                    animate
                  )}
                </div>
              );
            })}
            </div>
          </div>
          <div className="block sm:hidden text-center text-sm text-gray-400 mb-1 select-none px-1">
            ← Swipe to see more →
          </div>
        </div>
      )}

      {showWinMessage && guesses.length > 0 && guesses[0].correct && (
        <div ref={winMessageRef}>
          <WinMessage
            character={guesses[0].guess}
            nextUrl="/quote"
            nextLabel="Play Quote Mode →"
            onClose={() => setShowWinMessage(false)}
            share={{
              text: buildClassicShareText(guesses.map((g) => g.hints)),
              url: buildShareUrl("classic", guesses.length),
            }}
          >
            <CountdownTimer prefixText="Next character available in:" />
          </WinMessage>
        </div>
      )}
    </div>
  );
}
