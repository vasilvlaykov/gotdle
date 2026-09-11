"use client";

import Image from "next/image";
import { GoTdleStats } from "@/lib/stats";

type Props = {
  stats: GoTdleStats;
  onClose: () => void;
};

const MODES: { key: "classic" | "quote" | "banner"; label: string; icon: string }[] = [
  { key: "classic", label: "Classic", icon: "throne" },
  { key: "quote", label: "Quote", icon: "quotes" },
  { key: "banner", label: "Banner", icon: "banner" },
];

export default function StatsModal({ stats, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="modal-pop relative max-w-sm w-full text-center got-font aged-paper rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-5 tracking-wide">Your Stats</h2>

        <div className="mb-5">
          <span className="flame-icon text-5xl">🔥</span>
          <div className="text-4xl font-bold leading-tight mt-1">
            {stats.currentStreak}
          </div>
          <div className="text-xs uppercase tracking-widest opacity-80">
            Day Streak
          </div>
          {stats.maxStreak > stats.currentStreak && (
            <div className="text-xs mt-1 opacity-70">
              Best: {stats.maxStreak} days
            </div>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {MODES.map(({ key, label, icon }) => (
            <div
              key={key}
              className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-2"
            >
              <Image
                src={`/assets/${icon}-icon.png`}
                alt=""
                width={28}
                height={28}
              />
              <span className="flex-1 text-left font-semibold">{label}</span>
              <span className="text-sm opacity-80">
                {stats[key].played} played
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2 rounded next-game-btn text-white font-semibold"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
