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
    <section
      className="section relative overflow-hidden border-b border-(--line)"
      style={{
        background:
          "radial-gradient(at 100% 0%, rgba(13, 148, 136, 0.04) 0px, transparent 65%), radial-gradient(at 0% 100%, rgba(239, 68, 68, 0.02) 0px, transparent 65%), var(--background)",
      }}
    >
      <div className="container-page relative z-10">
        {/* Header */}
        <div className="max-w-xl">
          <p className="eyebrow">What you receive</p>
          <h2 className="heading mt-3">Rewards that make the finish feel real</h2>
          <p className="lede mt-3">
            Every verified runner gets a digital finish record, with physical rewards
            available based on the selected event kit.
          </p>
        </div>

        {/* Reward cards — 2-col on all mobile, 4-col on lg */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
          {rewards.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex flex-col rounded-(--radius) border border-(--line) bg-(--panel) p-4 shadow-xs sm:p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-bold tracking-tight text-(--foreground) sm:text-base">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-(--muted) sm:text-sm">
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
