"use client";

import { Award, ChevronRight, MapPinned, Upload } from "lucide-react";
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
    <section className="section border-b border-(--line) overflow-hidden">
      <div className="container-page">
        <HomeSectionHeader eyebrow="How it works" title="Three simple steps" />

        {/* Parallel in one horizontal line on mobile, 3-column grid on desktop */}
        <div className="mt-8 flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:gap-5 sm:mt-10 sm:overflow-visible sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="group relative flex w-[78vw] max-w-[300px] shrink-0 snap-center flex-col justify-between rounded-2xl border border-(--line) bg-(--panel) p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--sage)/30 hover:shadow-lg sm:w-auto sm:max-w-none sm:p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage) transition-colors duration-300 group-hover:bg-(--sage-soft) group-hover:text-(--sage)">
                      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-(--line-strong) transition-colors duration-300 group-hover:text-(--sage)/40">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base sm:text-lg font-bold tracking-tight text-(--foreground) transition-colors duration-300 group-hover:text-(--sage)">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-(--muted)">
                    {item.text}
                  </p>
                </div>

                {/* Mobile Step Indicator & Swipe Hint */}
                <div className="mt-4 flex items-center justify-between border-t border-(--line)/50 pt-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-(--sage) sm:hidden">
                  <span>Step {idx + 1} of 3</span>
                  {idx < 2 && (
                    <span className="flex items-center gap-0.5 text-(--muted)">
                      Swipe <ChevronRight className="h-3 w-3 text-(--sage)" />
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
