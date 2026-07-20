"use client";

import { FileBadge, Medal, Shirt, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HomeSectionHeader } from "./home-section-header";

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
        <HomeSectionHeader
          eyebrow="What you receive"
          title="Rewards that make the finish feel real"
          lead="Every verified runner gets a digital finish record, with physical rewards available based on the selected event kit."
        />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-4">
          {rewards.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="group flex flex-col rounded-2xl border border-(--line) bg-(--panel) p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--sage)/30 hover:shadow-lg sm:p-5"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage) transition-colors duration-300 group-hover:bg-(--sage-soft) group-hover:text-(--sage)">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-bold tracking-tight text-(--foreground) transition-colors duration-300 group-hover:text-(--sage) sm:text-base">
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
