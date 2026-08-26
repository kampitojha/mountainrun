"use client";

import { MapPin, Package, ShieldCheck } from "lucide-react";
import { HomeCtas } from "./home-ctas";

const trustPills = [
  { icon: ShieldCheck, label: "GPS verified (Strava / Garmin)" },
  { icon: MapPin, label: "Run anywhere across India" },
  { icon: Package, label: "Medals, T-shirts & Free Delivery" },
];

export function HomeHero() {
  return (
    <section className="hero-shell relative overflow-hidden border-b border-(--line)">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="hero-mesh-bg" />

      <div className="container-page relative py-8 sm:py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">

          <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3 py-1 text-[0.68rem] font-bold uppercase tracking-widest text-(--gold-deep) shadow-sm sm:px-3.5 sm:py-1.5 sm:text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            India&rsquo;s Premier Virtual Running &amp; Marathon Platform
          </p>

          <h1 className="display mt-4 font-black tracking-tight sm:mt-6">
            Virtual Running Events &amp; Marathons.
            <br />
            <span className="text-gradient-premium">Run Anywhere. Claim Real Medals.</span>
          </h1>

          <p className="lede mx-auto mt-3 max-w-xl px-2 text-sm sm:text-base sm:mt-4 sm:px-1 text-(--muted)">
            Join GPS-verified 1.5K, 5K, 10K, and 21K Half Marathon challenges. Track with Strava, Nike, or Garmin, and claim authentic heavyweight 3D finisher medals delivered to your doorstep.
          </p>

          <HomeCtas />

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-3">
            {trustPills.map(({ icon: Icon, label }) => (
              <li className="trust-pill" key={label}>
                <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-(--gold)" />
                <span>{label}</span>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </section>
  );
}
