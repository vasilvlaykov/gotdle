"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Logo() {
  const [hover, setHover] = useState(false);

  return (
    <Link href="/" style={{ display: "inline-block" }}>
      <div
        style={{
          display: "inline-block",
          transition: "transform 0.3s ease",
          transform: hover ? "scale(1.12)" : "scale(1)",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Image
          src="/assets/logo.png"
          alt="Go to homepage"
          // Source file is 610x409 (ratio ~1.49:1) — width/height here must
          // match that ratio or the browser stretches it to fit a square box.
          width={300}
          height={201}
          priority
          className="site-logo-img"
        />
      </div>
    </Link>
  );
}
