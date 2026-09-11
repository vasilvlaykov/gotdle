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

import { getDailyKey } from "@/lib/dailyKey"; // <-- import daily key
import { buildSimpleShareText } from "@/lib/shareText";

type Character = {
  uuid: string;
  name: string;
  image_url: string;
};

type Quote = {
  uuid: string;
  quote: string;
  recipient_id: string;
  recipient_image_url: string;
};

type CheckResult = {
  correct: boolean;
  guess: Character;
};

type QuoteGameState = {
  quoteUuid: string;
  wrongGuesses: Character[];
  correctGuess: Character | null;
  showWinMessage: boolean;
  hintRevealed: boolean;
};

const HINT_THRESHOLD = 5;

export default function QuoteGame() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Character[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<Character[]>([]);
  const [correctGuess, setCorrectGuess] = useState<Character | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [justAddedWrongGuessUuid, setJustAddedWrongGuessUuid] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const winRef = useRef<HTMLDivElement>(null);

  const { markCompleted } = useGameProgress();

  // Use daily key for storage
  const dailyKey = getDailyKey();
  const STORAGE_KEY = `quoteGameState_${dailyKey}`;

  useEffect(() => {
    async function loadQuote() {
      const res = await fetch("/api/quotes/today");
      const { data } = await res.json();
      setQuote(data);

      const saved = loadFromLocalStorage<QuoteGameState>(STORAGE_KEY);

      if (saved && saved.quoteUuid === data.uuid) {
        setWrongGuesses(saved.wrongGuesses || []);
        setCorrectGuess(saved.correctGuess || null);
        setShowWinMessage(saved.showWinMessage || false);
        setHintRevealed(saved.hintRevealed || false);

        if (saved.showWinMessage) {
          setTimeout(() => {
            winRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);
        }
      } else {
        removeFromLocalStorage(STORAGE_KEY);
      }
    }

    loadQuote();
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!quote) return;
    saveToLocalStorage(STORAGE_KEY, {
      quoteUuid: quote.uuid,
      wrongGuesses,
      correctGuess,
      showWinMessage,
      hintRevealed,
    });
  }, [quote, wrongGuesses, correctGuess, showWinMessage, hintRevealed, STORAGE_KEY]);

  useEffect(() => {
    async function loadCharacters() {
      const res = await fetch("/api/characters/all");
      const { data } = await res.json();
      setCharacters(data || []);
    }
    loadCharacters();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = sortSuggestions(characters, query, (c) => c.name)
      .filter(
        (c) =>
          !wrongGuesses.some((w) => w.uuid === c.uuid) &&
          !(correctGuess && c.uuid === correctGuess.uuid)
      )
      .slice(0, 10);

    setSuggestions(filtered);
  }, [query, characters, wrongGuesses, correctGuess]);

  if (!quote)
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-5xl text-white text-center got-font font-bold mb-4">
          Winter is loading...
        </h1>{" "}
        <div className="w-12 h-12 border-6 border-white/30 border-t-white rounded-full animate-spin text-center"></div>
      </div>
    );

  async function handleGuess(character: Character) {
    setQuery("");
    setSuggestions([]);

    const res = await fetch("/api/quotes/check", {
      method: "POST",
      body: JSON.stringify({
        quoteUuid: quote?.uuid,
        guessUuid: character.uuid,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const json: CheckResult = await res.json();

    setCharacters((prev) => prev.filter((c) => c.uuid !== character.uuid));

    if (json.correct) {
      setCorrectGuess(character);
      setShowCelebrate(true);
      markCompleted("quote", wrongGuesses.length + 1);
    } else {
      setWrongGuesses((prev) => [character, ...prev]);
      setJustAddedWrongGuessUuid(character.uuid);
    }

    inputRef.current?.focus();
  }

  const wrongCount = wrongGuesses.length;
  const guessesUntilHint = Math.max(0, HINT_THRESHOLD - wrongCount);
  const hintUnlocked = wrongCount >= HINT_THRESHOLD;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 relative game-box rounded-2xl">
      <h1 className="text-3xl font-bold mb-4 text-center got-font">Quote of the Day</h1>

      <blockquote className="text-xl italic got-font text-center mb-8">“{quote.quote}”</blockquote>

      <p className="font-semibold text-lg mt-2 text-center got-font">Who said this quote?</p>

      {/* --- HINT ABOVE INPUT (YELLOW) --- */}
      <div className="mt-4">
        {!hintUnlocked && (
          <div
            className="p-4 rounded border bg-yellow-50 border-yellow-300 text-yellow-700 text-center font-medium"
            style={{ cursor: "not-allowed" }}
          >
            🔒 Hint unlocks after{" "}
            <strong>{guessesUntilHint} more wrong guesses</strong>
          </div>
        )}

        {hintUnlocked && !hintRevealed && (
          <div
            onClick={() => setHintRevealed(true)}
            className="p-4 rounded border bg-yellow-100 border-yellow-500 text-yellow-800 text-center font-semibold cursor-pointer hover:bg-yellow-200 transition"
          >
            🔓 Hint available — click to reveal
          </div>
        )}

        {hintUnlocked && hintRevealed && (
          <div className="p-4 rounded border border-yellow-500 text-center quote-recipient-banner got-font text-xl">
            <h3 className="font-bold mb-2">Recipient of the quote:</h3>
            <img
              src={quote.recipient_image_url}
              alt="Quote recipient"
              className="mx-auto w-28 h-28 object-cover border-2 border-yellow-800 shadow"
            />
            <p className="mt-2 font-semibold">
              {characters.find((c) => c.uuid === quote.recipient_id)?.name ||
                "Unknown"}
            </p>
          </div>
        )}
      </div>

      {/* INPUT FIELD (NOW BELOW HINT) */}
      {!showWinMessage && !correctGuess && (
        <input
          type="text"
          placeholder="Type a character name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded mt-2"
          autoComplete="off"
          ref={inputRef}
          disabled={showCelebrate}
        />
      )}

      {/* Suggestions */}
      {suggestions.length > 0 &&
        !showWinMessage &&
        !showCelebrate &&
        !correctGuess && (
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

      {/* WRONG + CORRECT GUESSES */}
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
              alt={correctGuess.name}
              className="w-15 h-15 rounded object-cover border border-green-600"
            />
            <span className="font-semibold">{correctGuess.name}</span>
          </div>
        )}

        {correctGuess && !showCelebrate && (
          <div className="flex items-center gap-3 p-2 rounded border border-green-600 guess-list-item-green">
            <img
              src={correctGuess.image_url}
              alt={correctGuess.name}
              className="w-15 h-15 rounded object-cover border border-green-600"
            />
            <span className="font-semibold">{correctGuess.name}</span>
          </div>
        )}

        {wrongGuesses.map((char) => (
          <div
            key={char.uuid}
            className={`flex items-center gap-3 p-2 rounded border border-red-600 guess-list-item-red ${
              justAddedWrongGuessUuid === char.uuid ? "animate-shake" : ""
            }`}
            onAnimationEnd={() => {
              if (justAddedWrongGuessUuid === char.uuid) {
                setJustAddedWrongGuessUuid(null);
              }
            }}
          >
            <img
              src={char.image_url}
              alt={char.name}
              className="w-15 h-15 rounded object-cover border border-red-600"
            />
            <span className="font-semibold">{char.name}</span>
          </div>
        ))}
      </div>

      {/* Win Message */}
      {showWinMessage && correctGuess && (
        <div ref={winRef}>
          <WinMessage
            character={correctGuess}
            nextUrl="/banner"
            nextLabel="Play Banner Mode →"
            onClose={() => {
              removeFromLocalStorage(STORAGE_KEY);
              setShowWinMessage(false);
            }}
            shareText={buildSimpleShareText("Quote", wrongGuesses.length + 1)}
          >
            <CountdownTimer prefixText="Next character available in:" />
          </WinMessage>
        </div>
      )}
    </div>
  );
}
