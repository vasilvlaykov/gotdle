"use client";

import React, { useState, useEffect, useRef } from "react";
import { sortSuggestions } from "@/utils/sortSuggestions";
import WinMessage from "../components/WinMessage";
import CountdownTimer from "../components/CountdownTimer";
import { launchGoTConfetti } from "@/lib/confetti";
import useGameProgress from "@/hooks/useGameProgress";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "@/lib/localStorage";
import { getDailyKey } from "@/lib/dailyKey";
import { buildSimpleShareText } from "@/lib/shareText";

type Banner = {
  uuid: string;
  house_name: string;
  image_url: string;
};

type WordsToday = {
  words: string;
};

type CheckResult = {
  correct: boolean;
};

type WordsGameState = {
  wrongGuesses: Banner[];
  correctGuess: Banner | null;
  showWinMessage: boolean;
};

export default function WordsGame() {
  const [today, setToday] = useState<WordsToday | null>(null);
  const [houses, setHouses] = useState<Banner[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Banner[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<Banner[]>([]);
  const [correctGuess, setCorrectGuess] = useState<Banner | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [justAddedWrongGuessUuid, setJustAddedWrongGuessUuid] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const winRef = useRef<HTMLDivElement>(null);

  const { markCompleted } = useGameProgress();

  const dailyKey = getDailyKey();
  const STORAGE_KEY = `wordsGameState_${dailyKey}`;

  useEffect(() => {
    async function loadToday() {
      const res = await fetch("/api/words/today");
      const { data } = await res.json();
      setToday(data);

      const saved = loadFromLocalStorage<WordsGameState>(STORAGE_KEY);
      if (saved) {
        setWrongGuesses(saved.wrongGuesses || []);
        setCorrectGuess(saved.correctGuess || null);
        setShowWinMessage(saved.showWinMessage || false);

        if (saved.showWinMessage) {
          setTimeout(() => {
            winRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);
        }
      }
    }
    loadToday();
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!today) return;
    saveToLocalStorage(STORAGE_KEY, {
      wrongGuesses,
      correctGuess,
      showWinMessage,
    });
  }, [today, wrongGuesses, correctGuess, showWinMessage, STORAGE_KEY]);

  useEffect(() => {
    async function loadHouses() {
      const res = await fetch("/api/banners/all");
      const { data } = await res.json();
      setHouses(data || []);
    }
    loadHouses();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = sortSuggestions(houses, query, (h) => h.house_name)
      .filter(
        (h) =>
          !wrongGuesses.some((w) => w.uuid === h.uuid) &&
          !(correctGuess && h.uuid === correctGuess.uuid)
      )
      .slice(0, 10);

    setSuggestions(filtered);
  }, [query, houses, wrongGuesses, correctGuess]);

  if (!today)
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-5xl text-white text-center got-font font-bold mb-4">
          Winter is loading...
        </h1>{" "}
        <div className="w-12 h-12 border-6 border-white/30 border-t-white rounded-full animate-spin text-center"></div>
      </div>
    );

  async function handleGuess(house: Banner) {
    if (checking) return;

    setQuery("");
    setSuggestions([]);
    setChecking(true);

    try {
      const res = await fetch("/api/words/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guessUuid: house.uuid }),
      });
      const json: CheckResult = await res.json();

      setHouses((prev) => prev.filter((h) => h.uuid !== house.uuid));

      if (json.correct) {
        setCorrectGuess(house);
        setShowCelebrate(true);
        markCompleted("words", wrongGuesses.length + 1);
      } else {
        setWrongGuesses((prev) => [house, ...prev]);
        setJustAddedWrongGuessUuid(house.uuid);
      }
    } finally {
      setChecking(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 relative game-box rounded-2xl">
      <h1 className="text-3xl font-bold mb-4 text-center got-font">Words of the Day</h1>

      <blockquote className="text-2xl italic got-font text-center mb-8">
        &ldquo;{today.words}&rdquo;
      </blockquote>

      <p className="font-semibold text-lg mt-2 text-center got-font">
        Which house says these words?
      </p>

      {!showWinMessage && !correctGuess && (
        <input
          type="text"
          placeholder="Type a house name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded mt-2"
          autoComplete="off"
          ref={inputRef}
          disabled={showCelebrate}
        />
      )}

      {suggestions.length > 0 &&
        !showWinMessage &&
        !showCelebrate &&
        !correctGuess && (
          <div className="border rounded bg-black shadow max-h-64 overflow-y-auto absolute z-20 w-full">
            {suggestions.map((house) => (
              <div
                key={house.uuid}
                onClick={() => handleGuess(house)}
                className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer text-xl font-bold"
              >
                <img
                  src={house.image_url}
                  alt={house.house_name}
                  className="w-15 h-15 rounded object-cover"
                />
                <span>{house.house_name}</span>
              </div>
            ))}
          </div>
        )}

      <div className="space-y-2 mt-2 relative z-10 text-xl">
        {correctGuess && showCelebrate && (
          <div
            className="flex items-center gap-3 p-2 rounded border border-green-600 guess-list-item-green animate-celebrate"
            onAnimationEnd={() => {
              setShowCelebrate(false);
              setShowWinMessage(true);
              launchGoTConfetti();
              setTimeout(() => {
                winRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 200);
            }}
          >
            <img
              src={correctGuess.image_url}
              alt={correctGuess.house_name}
              className="w-15 h-15 rounded object-cover border border-green-600"
            />
            <span className="font-semibold">{correctGuess.house_name}</span>
          </div>
        )}

        {correctGuess && !showCelebrate && (
          <div className="flex items-center gap-3 p-2 rounded border border-green-600 guess-list-item-green">
            <img
              src={correctGuess.image_url}
              alt={correctGuess.house_name}
              className="w-15 h-15 rounded object-cover border border-green-600"
            />
            <span className="font-semibold">{correctGuess.house_name}</span>
          </div>
        )}

        {wrongGuesses.map((house) => (
          <div
            key={house.uuid}
            className={`flex items-center gap-3 p-2 rounded border border-red-600 guess-list-item-red ${
              justAddedWrongGuessUuid === house.uuid ? "animate-shake" : ""
            }`}
            onAnimationEnd={() => {
              if (justAddedWrongGuessUuid === house.uuid) {
                setJustAddedWrongGuessUuid(null);
              }
            }}
          >
            <img
              src={house.image_url}
              alt={house.house_name}
              className="w-15 h-15 rounded object-cover border border-red-600"
            />
            <span className="font-semibold">{house.house_name}</span>
          </div>
        ))}
      </div>

      {showWinMessage && correctGuess && (
        <div ref={winRef}>
          <WinMessage
            character={{
              uuid: correctGuess.uuid,
              name: correctGuess.house_name,
              image_url: correctGuess.image_url,
            }}
            revealText={
              <>
                These are the words of House <strong>{correctGuess.house_name}</strong>.
              </>
            }
            onClose={() => {
              removeFromLocalStorage(STORAGE_KEY);
              setShowWinMessage(false);
            }}
            shareText={buildSimpleShareText("Words", wrongGuesses.length + 1)}
          >
            <CountdownTimer prefixText="Next words available in:" />
          </WinMessage>
        </div>
      )}
    </div>
  );
}
