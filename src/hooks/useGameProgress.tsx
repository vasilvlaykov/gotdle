"use client";

import { useEffect, useState, useCallback } from "react";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "@/lib/localStorage";
import { getDailyKey } from "@/lib/dailyKey";

export type GameKey = "classic" | "quote" | "banner";

export type GameCompletionState = {
  classicDone: boolean;
  quoteDone: boolean;
  bannerDone: boolean;
  celebrationShown: boolean;
  dateKey: string;
};

const STORAGE_KEY = "gameCompletionState";

function defaultState(): GameCompletionState {
  return {
    classicDone: false,
    quoteDone: false,
    bannerDone: false,
    celebrationShown: false,
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

  const [showCongratsModal, setShowCongratsModal] = useState(false);

  // Save state on change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, state);
  }, [state]);

  // Check daily reset and congrats modal
  useEffect(() => {
    const today = getDailyKey();

    if (state.dateKey !== today) {
      // New day — reset progress
      setState(defaultState());
      setShowCongratsModal(false);
      return;
    }

    if (
      state.classicDone &&
      state.quoteDone &&
      state.bannerDone &&
      !state.celebrationShown
    ) {
      setShowCongratsModal(true);
      setState((prev) => ({ ...prev, celebrationShown: true }));
    }
  }, [state]);

  const markCompleted = useCallback((game: GameKey) => {
    setState((prev) => {
      const next = { ...prev };
      if (game === "classic") next.classicDone = true;
      if (game === "quote") next.quoteDone = true;
      if (game === "banner") next.bannerDone = true;

      if (
        next.classicDone &&
        next.quoteDone &&
        next.bannerDone &&
        !next.celebrationShown
      ) {
        setShowCongratsModal(true);
        next.celebrationShown = true;
      }

      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (game: GameKey) => {
      if (game === "classic") return state.classicDone;
      if (game === "quote") return state.quoteDone;
      if (game === "banner") return state.bannerDone;
      
      return false;
    },
    [state]
  );

  return {
    state,
    markCompleted,
    isCompleted,
    showCongratsModal,
    setShowCongratsModal,
  };
}
