"use client";

import { MapPin, Package, ShieldCheck } from "lucide-react";
import { HomeCtas } from "./home-ctas";

const trustPills = [
  { icon: ShieldCheck, label: "GPS verified finishes" },
  { icon: MapPin, label: "Run anywhere in India" },
  { icon: Package, label: "Medals & certificates" },
];

export function HomeHero() {
  return (
    <section className="hero-shell relative overflow-hidden border-b border-(--line)">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="hero-mesh-bg" />

      <div className="container-page relative py-12 sm:py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">

          <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--panel) px-3 py-1 text-[0.7rem] font-semibold text-(--foreground) shadow-sm sm:px-3.5 sm:py-1.5 sm:text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--sage) opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-(--sage)" />
            </span>
            India&rsquo;s Premier Virtual Running &amp; Marathon Platform
          </p>

          <h1 className="display mt-4 font-bold tracking-tight sm:mt-7">
            Virtual Running Events &amp; Marathons.
            <br />
            <span className="text-gradient-premium">Run Anywhere. Claim Real Medals.</span>
          </h1>

          <p className="lede mx-auto mt-4 max-w-xl px-2 sm:mt-6 sm:px-1">
            Join GPS-verified 5K, 10K, and 21K Half Marathon challenges from anywhere in India.
            Track with Strava or Garmin, rank on the national leaderboard, and get authentic heavy metal finisher medals delivered to your door.
          </p>

          <HomeCtas />

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-14 sm:gap-3.5">
            {trustPills.map(({ icon: Icon, label }) => (
              <li className="trust-pill" key={label}>
                <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-(--sage)" />
                <span>{label}</span>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </section>
  );
}
