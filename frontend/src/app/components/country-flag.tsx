"use client";

import { useState } from "react";
import { cn } from "../../lib/cn";

type CountryFlagProps = {
  code: string;
  className?: string;
  title?: string;
};

function flagSources(iso: string) {
  return [
    `https://flagcdn.com/w40/${iso}.png`,
    `https://flagcdn.com/w80/${iso}.png`,
    `https://flagcdn.com/${iso}.svg`,
  ] as const;
}

export function CountryFlag({
  code,
  className = "h-4 w-5 shrink-0 rounded-[2px] object-cover",
  title,
}: CountryFlagProps) {
  const iso = code.toLowerCase();
  const sources = flagSources(iso);
  const [sourceIndex, setSourceIndex] = useState(0);
  const label = title ? `${title} flag` : `${code} flag`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={label}
      className={cn("block bg-[var(--panel-soft)]", className)}
      decoding="async"
      height={15}
      loading="lazy"
      onError={() => {
        setSourceIndex((current) => (current < sources.length - 1 ? current + 1 : current));
      }}
      src={sources[sourceIndex]}
      width={20}
    />
  );
}
