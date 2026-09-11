"use client";

import React from "react";
import Image from "next/image";

type Props = {
  title: string;
  description: string;
  icon?: string;
  // Fallback rendered icon for modes without a dedicated /assets/*-icon.png yet.
  emojiIcon?: string;
};

export default function GameCard({
  title,
  description,
  icon,
  emojiIcon,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        border: "3px solid #6E4B1E",
        borderRadius: "12px",
        padding: "1rem 1.5rem",
        cursor: "pointer",
        clipPath:
          "polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow:
          "inset 0 0 4px 1px #8B6B34, 0 0 8px 1px #523B10, 0 0 0 1px #6E4B1E",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        userSelect: "none",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "scale(1.05)";
        el.style.boxShadow =
          "inset 0 0 7px 2px #C1A753, 0 0 12px 3px #886B2F, 0 0 0 1px #6E4B1E";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "scale(1)";
        el.style.boxShadow =
          "inset 0 0 4px 1px #8B6B34, 0 0 8px 1px #523B10, 0 0 0 1px #6E4B1E";
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          marginRight: "1rem",
          color: "#C1A753",
          userSelect: "none",
          minWidth: "2.5rem",
          textAlign: "center",
        }}
        aria-hidden="true"
      >
        {icon ? (
          <Image
            src={`/assets/${icon}-icon.png`}
            alt={`${icon}`}
            width={70}
            height={70}
            priority
          />
        ) : (
          <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>{emojiIcon}</span>
        )}
      </div>
      <div>
        <h2
          style={{
            margin: 0,
            fontWeight: "700",
            color: "#D9D6CE",
            fontSize: "1.75rem",
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.85)",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            color: "#C7C3BB",
            fontSize: "1.05rem",
            marginTop: "0.25rem",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
