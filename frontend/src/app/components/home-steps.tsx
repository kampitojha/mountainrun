"use client";

import { Award, MapPinned, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "./marketing/motion";
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
        background: "radial-gradient(at 0% 0%, rgba(13, 148, 136, 0.04) 0px, transparent 60%), radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.03) 0px, transparent 60%), var(--background)",
      }}
    >
      {/* Decorative premium ambient glow orbs */}
      <div aria-hidden="true" className="absolute -top-12 left-1/4 h-80 w-80 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute -bottom-12 right-1/4 h-80 w-80 rounded-full bg-indigo-500/4 blur-3xl pointer-events-none" />

      <div className="container-page relative z-10">
        <HomeSectionHeader eyebrow="How it works" title="Three simple steps" />

        <div className="relative mt-8 sm:mt-12">
          {/* Connector Line for Desktop */}
          <div className="absolute top-[2.35rem] left-[15%] right-[15%] hidden h-[1.5px] bg-linear-to-r from-emerald-500/10 via-(--line) to-indigo-500/10 md:block z-0" />
          
          <Stagger className="relative z-10 grid gap-5 md:grid-cols-3">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.step}>
                  <article className="feature-card card-premium-glow group h-full p-6 sm:p-8 bg-(--panel-glass) backdrop-blur-md border border-(--line) rounded-(--radius) shadow-xs transition-all duration-300 hover:bg-(--panel) hover:border-(--line-strong) hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="feature-icon glow-icon-bg shadow-xs transition-transform duration-300 group-hover:scale-110">
                        <Icon aria-hidden="true" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" strokeWidth={1.75} />
                      </div>
                      <span className="step-card-number text-2xl font-extrabold">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-bold tracking-tight text-foreground group-hover:text-(--sage) transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-6 text-(--muted)">{item.text}</p>
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
