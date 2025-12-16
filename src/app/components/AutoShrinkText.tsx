"use client";

import React, { useEffect, useRef, useState } from "react";

type AutoShrinkTextProps = {
  children: React.ReactNode;
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function AutoShrinkText({
  children,
  maxFontSize = 20,
  minFontSize = 10,
  className,
  style,
}: AutoShrinkTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    function adjustFontSize() {
      if (!containerRef.current || !textRef.current) return;

      const container = containerRef.current;
      const text = textRef.current;

      let currentFontSize = maxFontSize;
      setFontSize(currentFontSize);

      // Temporarily set fontSize to maxFontSize for measurement
      text.style.fontSize = `${currentFontSize}px`;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Shrink font size until text fits both width and height
      while (
        (text.scrollWidth > containerWidth || text.scrollHeight > containerHeight) &&
        currentFontSize > minFontSize
      ) {
        currentFontSize -= 1;
        text.style.fontSize = `${currentFontSize}px`;
      }
      setFontSize(currentFontSize);
    }

    adjustFontSize();

    // Adjust on window resize
    window.addEventListener("resize", adjustFontSize);
    return () => window.removeEventListener("resize", adjustFontSize);
  }, [children, maxFontSize, minFontSize]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        overflow: "hidden",

        /* Flex centering */
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
      title={typeof children === "string" ? children : undefined}
    >
      <div
        ref={textRef}
        style={{
          fontSize: fontSize,
          lineHeight: 1.1,
          whiteSpace: "normal",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          userSelect: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
