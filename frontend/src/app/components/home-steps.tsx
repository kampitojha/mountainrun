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
    <section className="section border-b border-(--line)">
      <div className="container-page">
        <HomeSectionHeader eyebrow="How it works" title="Three simple steps" />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 sm:mt-10">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="group flex flex-col rounded-2xl border border-(--line) bg-(--panel) p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--sage)/30 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage) transition-colors duration-300 group-hover:bg-(--sage-soft) group-hover:text-(--sage)">
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-2xl font-bold tabular-nums text-(--line-strong) transition-colors duration-300 group-hover:text-(--sage)/40">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-(--foreground) transition-colors duration-300 group-hover:text-(--sage)">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-(--muted) sm:text-base">
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
