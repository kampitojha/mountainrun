"use client";

import type { ReactNode } from "react";
import { Reveal } from "./marketing/motion";

export function HomeSectionHeader({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  align?: "left" | "split";
}) {
  if (align === "split") {
    return (
      <Reveal className="flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div className="max-w-xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="heading mt-3 sm:mt-4">{title}</h2>
          {lead ? <p className="lede mt-3">{lead}</p> : null}
        </div>
        {action ? (
          <div className="w-full shrink-0 sm:w-auto">{action}</div>
        ) : null}
      </Reveal>
    );
  }

  return (
    <Reveal className="max-w-xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="heading mt-3 sm:mt-4">{title}</h2>
      {lead ? <p className="lede mt-4">{lead}</p> : null}
    </Reveal>
  );
}
