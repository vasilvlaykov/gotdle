"use client";

import React, { useState, useEffect } from "react";

interface FlipHintProps {
  text: React.ReactNode;
  colorClass: string;
  delay: number;
  // Set to false for guesses restored from storage on load, so only guesses
  // made live during this session play the flip animation.
  animate?: boolean;
}

export default function FlipHint({ text, colorClass, delay, animate = true }: FlipHintProps) {
  const [flipped, setFlipped] = useState(!animate);

  useEffect(() => {
    if (!animate) return;

    const timeout = setTimeout(() => {
      setFlipped(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, animate]);

  return (
    <div
      className="w-[100px] h-[100px] perspective"
      title={typeof text === "string" ? text : undefined}
      style={{ margin: "2px" }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ease-in-out transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face: gray background */}
        <div
          className="absolute w-full h-full bg-gray-400 flex items-center justify-center p-1 backface-hidden rounded-sm"
          style={{ backfaceVisibility: "hidden" }}
        ></div>

        {/* Back face: colored background with text */}
        <div
          className={`absolute w-full h-full flex items-center justify-center p-1 backface-hidden rounded-sm flip-hint flip-hint-${colorClass}`}
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
