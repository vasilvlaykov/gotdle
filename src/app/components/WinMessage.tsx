"use client";

import React from "react";

interface WinMessageProps {
  character: {
    uuid: string;
    name: string;
    image_url: string;
  };
  nextUrl: string;
  nextLabel: string;
  onClose: () => void;
  children?: React.ReactNode; // <-- add children here
}

export default function WinMessage({
  character,
  nextUrl,
  nextLabel,
  children,
}: WinMessageProps) {
  return (
    <div className="max-w-md mx-auto p-6 bg-green-100 rounded shadow text-center aged-paper">
      <h2 className="text-3xl font-bold mb-4"> You Win! </h2>
      <img
        src={character.image_url}
        alt={character.name}
        className="mx-auto w-32 h-32 rounded object-cover mb-4 character-hint-img"
      />
      <p className="text-2xl mb-2">
        Today's character is <strong>{character.name}</strong>.
      </p>

      {children}

      <div className="mt-4 flex justify-center gap-4 next-game-btn">
        <a
          href={nextUrl}
          className="px-4 py-2 w-100"
        >
          {nextLabel}
        </a>
      </div>
    </div>
  );
}
