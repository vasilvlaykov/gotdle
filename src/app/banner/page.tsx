"use client";

import React, { useState, useEffect, useRef } from "react";
import { sortSuggestions } from "@/utils/sortSuggestions";
import CountdownTimer from "../components/CountdownTimer";
import { launchGoTConfetti } from "@/lib/confetti";
import useGameProgress from "@/hooks/useGameProgress";
import { getDailyKey } from "@/lib/dailyKey"; // <-- import daily key helper
import { buildSimpleShareText } from "@/lib/shareText";
import ShareResultButton from "../components/ShareResultButton";

type Banner = {
  uuid: string;
  house_name: string;
  image_url: string;
};

const dailyKey = getDailyKey();
const STORAGE_KEY = `bannerGameState_${dailyKey}`;

export default function BannerGame() {
  const [houses, setHouses] = useState<Banner[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Banner[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<Banner[]>([]);
  const [correctGuess, setCorrectGuess] = useState<Banner | null>(null);
  const [checking, setChecking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const { markCompleted } = useGameProgress();

  useEffect(() => {
    async function loadGame() {
      let savedState: { correctGuess: Banner | null; wrongGuesses: Banner[] } | null = null;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          savedState = JSON.parse(saved);
        }
      } catch {}

      const [housesRes, todayRes] = await Promise.all([
        fetch("/api/banners/all"),
        fetch("/api/banners/today"),
      ]);
      const housesJson = await housesRes.json();
      const todayJson = await todayRes.json();

      setReady(!!todayJson?.data);

      const fetchedHouses: Banner[] = housesJson.data || [];

      if (savedState) {
        setCorrectGuess(savedState.correctGuess || null);
        setWrongGuesses(savedState.wrongGuesses || []);

        const guessedUUIDs = new Set<string>();
        if (savedState.correctGuess) guessedUUIDs.add(savedState.correctGuess.uuid);
        (savedState.wrongGuesses || []).forEach((h) => guessedUUIDs.add(h.uuid));

        setHouses(fetchedHouses.filter((h) => !guessedUUIDs.has(h.uuid)));
      } else {
        setHouses(fetchedHouses);
      }
    }

    loadGame();
  }, []);

  useEffect(() => {
    if (correctGuess || wrongGuesses.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ correctGuess, wrongGuesses })
      );
    }
  }, [correctGuess, wrongGuesses]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = sortSuggestions(houses, query, (h) => h.house_name)
      .filter(
        (h) =>
          !wrongGuesses.some((w) => w.uuid === h.uuid) &&
          !(correctGuess && correctGuess.uuid === h.uuid)
      )
      .slice(0, 10);

    setSuggestions(filtered);
  }, [query, houses, wrongGuesses, correctGuess]);

  if (!ready)
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-5xl text-white text-center got-font font-bold mb-4">
          Winter is loading...
        </h1>{" "}
        <div className="w-12 h-12 border-6 border-white/30 border-t-white rounded-full animate-spin text-center"></div>
      </div>
    );

  // The banner image is blurred server-side (see /api/banners/image) based on
  // wrong-guess count — the unblurred source is never sent to the client
  // before it's earned, unlike a client-side CSS blur which can be inspected.
  const imageSrc = `/api/banners/image?wrong=${wrongGuesses.length}${
    correctGuess ? "&revealed=1" : ""
  }`;

  async function handleGuess(guess: Banner) {
    setQuery("");
    setSuggestions([]);

    if (
      checking ||
      wrongGuesses.some((w) => w.uuid === guess.uuid) ||
      (correctGuess && correctGuess.uuid === guess.uuid)
    ) {
      inputRef.current?.focus();
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/banners/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guessUuid: guess.uuid }),
      });
      const { correct } = await res.json();

      if (correct) {
        setCorrectGuess(guess);

        markCompleted("banner", wrongGuesses.length + 1);

        setTimeout(() => {
          launchGoTConfetti();

          successRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      } else {
        setWrongGuesses((prev) => [guess, ...prev]);
      }

      setHouses((prev) => prev.filter((h) => h.uuid !== guess.uuid));
    } catch (err) {
      console.error("Guess check error:", err);
    } finally {
      setChecking(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 relative game-box rounded-2xl">
      <h1 className="text-3xl font-bold mb-4 text-center got-font mb-12">
        Guess the House Banner
      </h1>

      <div
        ref={bannerRef}
        className="mx-auto mb-12"
        style={{
          width: 240,
          height: 240,
          position: "relative",
        }}
      >
        <img
          src={imageSrc}
          alt={correctGuess ? correctGuess.house_name : "Mystery banner"}
          className="w-full h-full object-contain rounded-lg"
          draggable={false}
        />
      </div>

      {correctGuess && (
        <div
          ref={successRef}
          className="text-center mt-1 mb-4 animate-fade-in got-font banner-game-congratulations"
        >
          <h2 className="text-3xl font-bold mb-4">You win</h2>
          <p className="text-xl mb-12">
            This is the banner of House <strong>{correctGuess.house_name}</strong>.
          </p>
          <div className="mb-6 flex justify-center gap-4 flex-wrap">
            <ShareResultButton
              text={buildSimpleShareText("Banner", wrongGuesses.length + 1)}
            />
            <a href="/words" className="px-4 py-2 w-100 next-game-btn">
              Play Words Mode →
            </a>
          </div>
          <CountdownTimer prefixText="Next banner available in:" />
        </div>
      )}

      {!correctGuess && (
        <div>
          <h3 className="text-sm got-font font-bold mb-4 text-center">
            Each try unblurs the image a bit
          </h3>
          <input
            type="text"
            placeholder="Type a house name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            autoComplete="off"
            ref={inputRef}
            disabled={!!correctGuess}
          />
        </div>
      )}

      {suggestions.length > 0 && !correctGuess && (
        <div className="border rounded bg-black shadow max-h-64 overflow-y-auto absolute z-20 w-full text-xl">
          {suggestions.map((house) => (
            <div
              key={house.uuid}
              onClick={() => handleGuess(house)}
              className="p-2 hover:bg-gray-700 cursor-pointer"
            >
              {house.house_name}
            </div>
          ))}
        </div>
      )}

      {correctGuess && (
        <div
          key={correctGuess.uuid}
          className="flex items-center gap-3 p-2 rounded border border-green-600 mt-2 animate-celebrate guess-list-item-green"
        >
          <img
            src={correctGuess.image_url}
            alt={correctGuess.house_name}
            className="w-15 h-15 rounded object-cover"
          />
          <span className="font-semibold text-xl">{correctGuess.house_name}</span>
        </div>
      )}

      <div className="space-y-2 mt-2">
        {wrongGuesses.map((house) => (
          <div
            key={house.uuid}
            className="flex items-center gap-3 p-2 rounded border border-red-600 bg-red-100 guess-list-item-red animate-shake"
          >
            <img
              src={house.image_url}
              alt={house.house_name}
              className="w-15 h-15 rounded object-cover"
            />
            <span className="font-semibold text-xl">{house.house_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
