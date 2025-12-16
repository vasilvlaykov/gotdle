"use client";

import { useEffect, useState, useCallback } from "react";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "@/lib/localStorage";

export type GameKey = "classic" | "quote" | "banner";

export type GameCompletionState = {
  classicDone: boolean;
  quoteDone: boolean;
  bannerDone: boolean;
  celebrationShown: boolean;
};

const STORAGE_KEY = "gameCompletionState";

function defaultState(): GameCompletionState {
  return {
    classicDone: false,
    quoteDone: false,
    bannerDone: false,
    celebrationShown: false,
  };
}

export default function useGameProgress() {
  const [state, setState] = useState<GameCompletionState>(() => {
    try {
      const saved = loadFromLocalStorage<GameCompletionState>(STORAGE_KEY);
      return saved ?? defaultState();
    } catch {
      return defaultState();
    }
  });

  const [showCongratsModal, setShowCongratsModal] = useState(false);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, state);
  }, [state]);

  useEffect(() => {
    if (state.classicDone && state.quoteDone && state.bannerDone && !state.celebrationShown) {
      setShowCongratsModal(true);
      setState((prev) => ({ ...prev, celebrationShown: true }));
    }
  }, []);

  const markCompleted = useCallback((game: GameKey) => {
    setState((prev) => {
      const next = { ...prev };
      if (game === "classic") next.classicDone = true;
      if (game === "quote") next.quoteDone = true;
      if (game === "banner") next.bannerDone = true;

      if (next.classicDone && next.quoteDone && next.bannerDone && !next.celebrationShown) {
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
      return state.bannerDone;
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
