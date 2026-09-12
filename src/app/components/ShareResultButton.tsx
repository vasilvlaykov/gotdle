"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  url: string;
};

function buildPlatformLinks(text: string, url: string) {
  return [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent("My GoTdle Result")}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    },
  ];
}

export default function ShareResultButton({ text, url }: Props) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullText = `${text}\n${url}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopyStatus("copied");
    } catch {
      // Clipboard API can be denied (browser settings, permissions policy,
      // insecure context) — fall back to a manual-copy prompt.
      setCopyStatus("error");
      window.prompt("Copy your result:", fullText);
    }
    setTimeout(() => setCopyStatus("idle"), 2000);
  }

  async function handleClick() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        // Share only the URL. Some targets (Messenger on Android, confirmed
        // by testing) badly mangle/duplicate the message when descriptive
        // text and a link are both present — the app tries to generate its
        // own preview alongside the raw text and corrupts the result. The
        // /share page carries its own Open Graph title/description/image,
        // so the bare link still unfurls into the full result card on every
        // platform that supports link previews.
        await navigator.share({ url });
        return;
      } catch (err) {
        // AbortError = the user closed the native share sheet — not a failure.
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    setShowMenu((prev) => !prev);
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={handleClick}
        className="px-4 py-2 rounded border border-yellow-700 bg-black/60 text-yellow-100 hover:bg-black/80 transition got-font"
        type="button"
      >
        Share Result
      </button>

      {showMenu && (
        <div className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 bg-black/95 border border-yellow-700 rounded-lg p-2 flex flex-col gap-1 w-48 shadow-xl got-font">
          {buildPlatformLinks(text, url).map((platform) => (
            <a
              key={platform.label}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded hover:bg-yellow-900/40 text-sm text-left text-yellow-100"
              onClick={() => setShowMenu(false)}
            >
              {platform.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded hover:bg-yellow-900/40 text-sm text-left text-yellow-100 border-t border-yellow-900/60 mt-1 pt-2"
          >
            {copyStatus === "copied"
              ? "Copied!"
              : copyStatus === "error"
                ? "Couldn't copy"
                : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
