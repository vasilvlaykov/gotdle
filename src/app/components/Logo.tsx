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
          width={300}
          height={300}
          priority
        />
      </div>
    </Link>
  );
}
