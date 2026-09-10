"use client";

import { useState } from "react";

export default function ShareResultButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      // Clipboard API can be denied (browser settings, permissions policy,
      // insecure context) — fall back to a manual-copy prompt so the
      // result is still shareable.
      setStatus("error");
      window.prompt("Copy your result:", text);
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 rounded border border-yellow-700 bg-black/60 text-yellow-100 hover:bg-black/80 transition got-font"
      type="button"
    >
      {status === "copied" ? "Copied!" : status === "error" ? "Couldn't copy" : "Share Result"}
    </button>
  );
}
