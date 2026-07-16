"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownProps = {
  /** ISO date string for event start */
  targetIso: string;
  className?: string;
};

function getParts(targetMs: number, nowMs: number) {
  const diff = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit">
      <div className="countdown-value">{String(value).padStart(2, "0")}</div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

export function Countdown({ targetIso, className = "" }: CountdownProps) {
  const targetMs = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = getParts(targetMs, now);

  if (parts.done) {
    return (
      <div className={`glass-panel px-4 py-3 text-sm text-white/80 ${className}`}>
        Event window is live — register before it closes.
      </div>
    );
  }

  return (
    <div
      aria-label="Countdown to next event"
      className={`glass-panel inline-flex flex-wrap items-center gap-3 px-4 py-3 sm:gap-5 sm:px-5 sm:py-4 ${className}`}
    >
      <Unit label="Days" value={parts.days} />
      <span className="text-white/25" aria-hidden>
        :
      </span>
      <Unit label="Hours" value={parts.hours} />
      <span className="text-white/25" aria-hidden>
        :
      </span>
      <Unit label="Minutes" value={parts.minutes} />
      <span className="hidden text-white/25 sm:inline" aria-hidden>
        :
      </span>
      <div className="hidden sm:block">
        <Unit label="Seconds" value={parts.seconds} />
      </div>
    </div>
  );
}
