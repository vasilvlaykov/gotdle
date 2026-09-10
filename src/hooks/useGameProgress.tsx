"use client";

import { useEffect, useState, useCallback } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/localStorage";
import { getDailyKey } from "@/lib/dailyKey";
import { recordModeWin, recordDayCompleted, type GameKey } from "@/lib/stats";

export type { GameKey };

export type GameCompletionState = {
  classicDone: boolean;
  quoteDone: boolean;
  bannerDone: boolean;
  dateKey: string;
};

const STORAGE_KEY = "gameCompletionState";

function defaultState(): GameCompletionState {
  return {
    classicDone: false,
    quoteDone: false,
    bannerDone: false,
    dateKey: getDailyKey(),
  };
}

export default function useGameProgress() {
  const [state, setState] = useState<GameCompletionState>(() => {
    try {
      const saved = loadFromLocalStorage<GameCompletionState>(STORAGE_KEY);
      if (saved) {
        // If stored dateKey is different from today, reset state
        if (saved.dateKey !== getDailyKey()) {
          return defaultState();
        }
        return saved;
      }
      return defaultState();
    } catch {
      return defaultState();
    }
  });

  // Save state on change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, state);
  }, [state]);

  // Check daily reset
  useEffect(() => {
    const today = getDailyKey();
    if (state.dateKey !== today) {
      setState(defaultState());
    }
  }, [state.dateKey]);

  const markCompleted = useCallback((game: GameKey, guesses: number) => {
    recordModeWin(game, guesses);

    setState((prev) => {
      const next = {
        ...prev,
        classicDone: game === "classic" ? true : prev.classicDone,
        quoteDone: game === "quote" ? true : prev.quoteDone,
        bannerDone: game === "banner" ? true : prev.bannerDone,
      };

      if (next.classicDone && next.quoteDone && next.bannerDone) {
        recordDayCompleted(next.dateKey);
      }

      return next;
    });
  }, []);

  return {
    state,
    markCompleted,
  };
}
