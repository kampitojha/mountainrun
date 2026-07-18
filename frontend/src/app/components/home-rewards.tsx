"use client";

import { FileBadge, Medal, Shirt, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./marketing/motion";

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
    text: "Official duration, split pacing, and stats verified on the leaderboard.",
    icon: Trophy,
  },
];

export function HomeRewards() {
  return (
    <section 
      className="section relative overflow-hidden border-b border-(--line)"
      style={{
        background: "radial-gradient(at 100% 0%, rgba(13, 148, 136, 0.04) 0px, transparent 65%), radial-gradient(at 0% 100%, rgba(239, 68, 68, 0.02) 0px, transparent 65%), var(--background)",
      }}
    >
      {/* Decorative ambient orbs */}
      <div aria-hidden="true" className="absolute top-1/4 right-10 h-72 w-72 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-1/4 left-10 h-72 w-72 rounded-full bg-rose-500/3 blur-3xl pointer-events-none" />

      <div className="container-page relative z-10">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal className="space-y-4">
            <p className="eyebrow text-(--sage) font-bold tracking-widest">What you receive</p>
            <h2 className="heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              Rewards that make the finish feel real
            </h2>
            <p className="lede text-base leading-relaxed text-(--muted)">
              Every verified runner gets a digital finish record, with physical rewards
              available based on the selected event kit.
            </p>
          </Reveal>

          <Stagger className="grid gap-5 sm:grid-cols-2">
            {rewards.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <article className="feature-card card-premium-glow group h-full p-6 bg-(--panel-glass) backdrop-blur-md border border-(--line) rounded-(--radius) shadow-xs transition-all duration-300 hover:bg-(--panel) hover:border-(--line-strong) hover:shadow-md hover:-translate-y-1">
                    <div className="feature-icon glow-icon-bg shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-(--sage-soft)">
                      <Icon 
                        aria-hidden="true" 
                        className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" 
                        strokeWidth={1.75} 
                      />
                    </div>
                    <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-(--sage)">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-(--muted)">{item.text}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
