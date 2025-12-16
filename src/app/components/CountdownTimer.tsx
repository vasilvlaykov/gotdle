import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  prefixText: string;
  classList?: string;
  onComplete?: () => void;
}

function getNextMidnight() {
  const now = new Date();
  const d = new Date(now);
  d.setHours(24, 0, 0, 0);
  return d;
}

export default function CountdownTimer({ prefixText, classList, onComplete }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const targetTime = getNextMidnight();
    const diff = Math.floor((targetTime.getTime() - new Date().getTime()) / 1000);
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (secondsLeft === 0) {
      if (onComplete) onComplete();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onComplete]);

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  }

  return (
    <div className={classList}>
      <p className="mt-4 text-xl text-center">{prefixText}</p>
      <p className="text-black-700 countdown font-mono text-3xl">
        <strong>{formatTime(secondsLeft)}</strong>
      </p>
    </div>
  );
}
