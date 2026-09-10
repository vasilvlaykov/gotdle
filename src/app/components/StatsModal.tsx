"use client";

import { GoTdleStats, averageGuesses } from "@/lib/stats";

type Props = {
  stats: GoTdleStats;
  onClose: () => void;
};

const MODES: { key: "classic" | "quote" | "banner"; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "quote", label: "Quote" },
  { key: "banner", label: "Banner" },
];

export default function StatsModal({ stats, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-black/90 border border-yellow-700 rounded-xl p-6 max-w-sm w-full text-center got-font text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Your Stats</h2>

        <div className="flex justify-center gap-8 mb-6">
          <div>
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs uppercase tracking-wide text-gray-300">
              Current Streak
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.maxStreak}</div>
            <div className="text-xs uppercase tracking-wide text-gray-300">
              Max Streak
            </div>
          </div>
        </div>

        <div className="space-y-2 text-left mb-6">
          {MODES.map(({ key, label }) => {
            const modeStats = stats[key];
            const avg = averageGuesses(modeStats);
            return (
              <div
                key={key}
                className="flex justify-between border-b border-yellow-900 pb-1"
              >
                <span>{label}</span>
                <span className="text-sm text-gray-300">
                  {modeStats.played} played
                  {avg !== null ? ` · avg ${avg.toFixed(1)} guesses` : ""}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-yellow-800 hover:bg-yellow-700 text-white"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
