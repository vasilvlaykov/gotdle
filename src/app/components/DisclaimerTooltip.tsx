"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";

export default function DisclaimerTooltip() {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  const handleIconClick = () => {
    setVisible((v) => !v);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    }

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible]);

  return (
    <div className="sticky top-8 right-4 z-50">
      <div
        ref={iconRef}
        onClick={handleIconClick}
        className="cursor-pointer select-none"
      >
        <Image
          src="/assets/disclaimer-tooltip-icon.png"
          alt="Disclaimer"
          width={50}
          height={50}
          draggable={false}
        />
      </div>

      <div
        ref={tooltipRef}
        className={`
          absolute top-0 right-10
          shadow-xl
          max-w-[80vw] w-[350px]
          transition-opacity duration-200
          whitespace-normal
          select-text
          pointer-events-auto
          ${visible ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        style={{ willChange: "opacity" }}
      >
        <Image
          src="/assets/disclaimer.png"
          alt="Game of Thrones Disclaimer"
          width={600}
          height={600}
          className="w-full h-auto max-w-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
