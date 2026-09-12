"use client";

import React from "react";
import Image from "next/image";

type Props = {
  title: string;
  description: string;
  icon?: string;
  isNew?: boolean;
};

export default function GameCard({
  title,
  description,
  icon,
  isNew,
}: Props) {
  return (
    <div
      className="game-card"
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
        className="game-card-icon-wrap"
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
        {isNew && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "14px",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#F3E7C9",
              background: "linear-gradient(to bottom, #8a5a44, #5c3a2a)",
              border: "1px solid #C1A753",
              borderRadius: "4px",
              padding: "2px 6px",
              textTransform: "uppercase",
              boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            New
          </span>
        )}
        <Image
          className="game-card-icon-img"
          src={`/assets/${icon}-icon.png`}
          alt={`${icon}`}
          width={70}
          height={70}
          priority
        />
      </div>
      <div>
        <h2
          className="game-card-title"
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
          className="game-card-desc"
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
