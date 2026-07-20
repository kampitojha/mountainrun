"use client";

import { FileBadge, Medal, Shirt, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const rewards: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Finisher medal",
    text: "A physical medal shipped after your proof is verified.",
    icon: Medal,
  },
  {
    title: "E-certificate",
    text: "QR-linked certificate for every verified finisher.",
    icon: FileBadge,
  },
  {
    title: "Merch & T-shirt",
    text: "Optional event merchandise for premium race kits.",
    icon: Shirt,
  },
  {
    title: "Verified Timing",
    text: "Official duration, split pacing, and stats on the leaderboard.",
    icon: Trophy,
  },
];

export function HomeRewards() {
  return (
    <section className="section border-b border-(--line)">
      <div className="container-page">
        {/* Header */}
        <div>
          <p className="eyebrow">What you receive</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
            Rewards that make the finish feel real
          </h2>
          <p className="lede mt-4 max-w-2xl">
            Every verified runner gets a digital finish record, with physical rewards
            available based on the selected event kit.
          </p>
        </div>

        {/* Cards — 2 col mobile, 4 col desktop */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-4">
          {rewards.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex flex-col rounded-2xl border border-(--line) bg-(--panel) p-4 sm:p-5"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-bold tracking-tight text-(--foreground) sm:text-base">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-(--muted) sm:text-sm">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
