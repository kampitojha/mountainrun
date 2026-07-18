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

      <div className="container-page relative py-16 sm:py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--sage)] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--sage)]"></span>
              </span>
              Virtual running events
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="display mt-5 sm:mt-7 font-bold tracking-tight">
              Run anywhere.
              <br />
              <span className="text-gradient-premium">Finish with proof.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="lede mx-auto mt-5 max-w-xl px-1 sm:mt-6">
              Clean virtual races with GPS verification, leaderboards, certificates,
              medals, and event merch for runners across India.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <HomeCtas />
          </FadeIn>

          <Reveal className="mt-12 sm:mt-16" delay={0.1}>
            <ul className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
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
