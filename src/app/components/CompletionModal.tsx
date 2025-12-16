// src/components/CompletionModal.tsx
"use client";

import React from "react";
import useCountdown from "@/hooks/useCountdown";

type Props = {
  onClose: () => void;
};

export default function CompletionModal({ onClose }: Props) {
  const { str: timeStr, hours, minutes, seconds } = useCountdown(1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full shadow-lg mx-4">
        <h2 className="text-2xl font-bold mb-2">🎉 You completed all games today!</h2>
        <p className="mb-4">Great job — new puzzles will be available in:</p>

        <div className="text-center font-mono text-2xl mb-4">{timeStr}</div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Close (view results)
          </button>
        </div>
      </div>
    </div>
  );
}
