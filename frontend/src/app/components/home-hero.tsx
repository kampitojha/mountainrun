"use client";

import { MapPin, Package, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { FadeIn, Reveal } from "./marketing/motion";
import { HomeCtas } from "./home-ctas";

const trustPills = [
  { icon: ShieldCheck, label: "GPS verified finishes" },
  { icon: MapPin, label: "Run anywhere in India" },
  { icon: Package, label: "Medals & certificates" },
];

export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section className="hero-shell relative overflow-hidden border-b border-[var(--line)]">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="hero-mesh-bg" />
      {!reduce ? (
        <>
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
        </>
      ) : null}

      <div className="container-page relative py-12 sm:py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-(--panel) px-3 py-1 text-[0.7rem] font-semibold text-[var(--foreground)] shadow-sm sm:px-3.5 sm:py-1.5 sm:text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--sage)] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--sage)]"></span>
              </span>
              Virtual running events
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="display mt-4 font-bold tracking-tight sm:mt-7">
              Run anywhere.
              <br />
              <span className="text-gradient-premium">Finish with proof.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="lede mx-auto mt-4 max-w-xl px-2 sm:mt-6 sm:px-1">
              Clean virtual races with GPS verification, leaderboards, certificates,
              medals, and event merch for runners across India.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <HomeCtas />
          </FadeIn>

          <Reveal className="mt-8 sm:mt-16" delay={0.1}>
            <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5">
              {trustPills.map(({ icon: Icon, label }) => (
                <li className="trust-pill" key={label}>
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--sage)]" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
