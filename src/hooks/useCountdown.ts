// src/hooks/useCountdown.ts
import { useEffect, useState } from "react";

function msToHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { hours, minutes, seconds, str: `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}` };
}

export function getMsUntilNextMidnightUTC() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.max(0, next.getTime() - now.getTime());
}

export default function useCountdown(tickMs = 1000) {
  const [msLeft, setMsLeft] = useState(() => getMsUntilNextMidnightUTC());

  useEffect(() => {
    const id = setInterval(() => {
      setMsLeft(getMsUntilNextMidnightUTC());
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  return { msLeft, ...msToHMS(msLeft) };
}
