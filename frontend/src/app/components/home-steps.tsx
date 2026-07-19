"use client";

import { Award, MapPinned, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HomeSectionHeader } from "./home-section-header";

const steps: { step: string; title: string; text: string; icon: LucideIcon }[] = [
  {
    step: "01",
    title: "Choose your run",
    text: "Pick an event, distance, and reward kit before you register.",
    icon: MapPinned,
  },
  {
    step: "02",
    title: "Run & upload proof",
    text: "Finish anywhere, then submit your GPS activity screenshot.",
    icon: Upload,
  },
  {
    step: "03",
    title: "Get verified rewards",
    text: "Unlock leaderboard rank, certificate, medal, and selected merch.",
    icon: Award,
  },
];

export function HomeSteps() {
  return (
    <section
      className="section relative overflow-hidden border-b border-(--line)"
      style={{
        background:
          "radial-gradient(at 0% 0%, rgba(13, 148, 136, 0.04) 0px, transparent 60%), radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.03) 0px, transparent 60%), var(--background)",
      }}
    >
      <div className="container-page relative z-10">
        <HomeSectionHeader eyebrow="How it works" title="Three simple steps" />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:mt-10 sm:gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="flex flex-col rounded-(--radius) border border-(--line) bg-(--panel) p-5 shadow-xs sm:p-6"
              >
                {/* Top row: icon left, step number right */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-2xl font-extrabold tabular-nums text-(--line-strong)">
                    {item.step}
                  </span>
                </div>

                {/* Text */}
                <h3 className="mt-4 text-base font-bold tracking-tight text-(--foreground)">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-(--muted)">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
