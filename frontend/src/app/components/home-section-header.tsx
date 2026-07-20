"use client";

import type { ReactNode } from "react";

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
      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
            {title}
          </h2>
          {lead ? (
            <p className="lede mt-3 max-w-xl">{lead}</p>
          ) : null}
        </div>
        {action ? (
          <div className="w-full shrink-0 sm:w-auto">{action}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p className="lede mt-4 max-w-2xl">{lead}</p>
      ) : null}
    </div>
  );
}
