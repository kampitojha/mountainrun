"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPinned,
  Smartphone,
  ArrowUpRight,
  FileBadge,
  Medal,
  Shirt,
  Sparkles,
  Trophy,
  Truck,
  Award,
  ShieldCheck,
  ZoomIn,
  CheckCircle2,
} from "lucide-react";
import { Reveal, SectionHeader } from "./reveal";
import { MedalInspectorModal } from "./medal-inspector-modal";

const mergedFeatures = [
  {
    icon: Medal,
    title: "100% Solid Metal Finisher Medal",
    desc: "Heavyweight zinc alloy with 3D sculpted athlete figures & dual-tone antique gold finish.",
  },
  {
    icon: Shirt,
    title: "Performance Finisher T-Shirt",
    desc: "Breathable, athletic-fit moisture-wicking tee customized for this event.",
  },
  {
    icon: FileBadge,
    title: "Official Printed Certificate",
    desc: "Your verified run timing, bib number, and distance on a heavy glossy certificate.",
  },
  {
    icon: Truck,
    title: "Free Pan-India Delivery",
    desc: "Tracked courier delivery right to your doorstep anywhere in India (19,000+ pin codes).",
  },
  {
    icon: Smartphone,
    title: "GPS Proof Verification",
    desc: "Run anywhere using Strava, Nike, Garmin, or treadmill. Verified by our timing team.",
  },
  {
    icon: Trophy,
    title: "National Leaderboard & Hall of Fame",
    desc: "Official ranking on the Mountain Run leaderboard alongside runners nationwide.",
  },
];

const medalSpecs = [
  { label: "Material", value: "Solid Heavy Zinc Alloy (Zero Plastic)" },
  { label: "Finish", value: "Dual-Tone Antique Gold + 3D Relief" },
  { label: "Diameter", value: "70mm Large Medallion (4mm Thickness)" },
  { label: "Ribbon", value: "32mm High-Density Custom Satin Lanyard" },
  { label: "Front Engraving", value: "Multi-Sport Athletes + Mountain Peak & Tricolor" },
  { label: "Back Inscription", value: "Laurel Wreath + 'Finish with Pride Leave a Legacy'" },
];

export function EventRewards({
  event,
}: {
  event?: {
    name?: string;
    slug?: string;
    price?: string;
    medalImageUrl?: string | null;
  };
}) {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const medalImg =
    event?.medalImageUrl ||
    (event?.slug === "sports-day-celebration" ? "/images/sports-day-medal.jpg" : undefined);
  const hasMedalImage = Boolean(medalImg);
  const eventName = event?.name || "Sports Day Celebration";
  const slug = event?.slug || "sports-day-celebration";
  const price = event?.price ? event.price.replace(/^Rs\.\s*/, "₹") : undefined;

  return (
    <section id="rewards" className="section scroll-mt-24 border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="Finisher Rewards & Craftsmanship"
          title={
            <>
              Crafted for champions,{" "}
              <span className="text-gold">built to last forever</span>
            </>
          }
          lead="No cheap plastic or hollow badges. Every registered finisher receives a heavyweight, die-cast collectible medal delivered straight to their home."
        />

        <div className="mt-8 grid items-start gap-8 sm:mt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Left Column: Reward Features & Craftsmanship Specs */}
          <div className="space-y-6">
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {mergedFeatures.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 0.04}>
                  <article className="group flex flex-col items-start gap-3 rounded-2xl border border-(--line) bg-(--panel) p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--gold-line) hover:shadow-premium sm:p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--gold-line) bg-gradient-to-br from-(--gold-soft) to-white/5 text-(--gold-deep) shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold tracking-tight text-(--foreground)">
                        {title}
                      </h3>
                      <p className="mt-1 text-[0.7rem] leading-relaxed text-(--muted) sm:text-xs">
                        {desc}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            {/* Medal Specifications Box */}
            <Reveal delay={0.25}>
              <div className="overflow-hidden rounded-2xl border border-(--gold-line) bg-(--panel-soft) p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--gold-soft) text-(--gold-deep)">
                    <Award className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-(--foreground)">
                      Finisher Medal Craftsmanship Specifications
                    </h4>
                    <p className="text-[0.65rem] text-(--muted) uppercase tracking-wider">
                      Museum-grade quality · Hand-polished dual finish
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {medalSpecs.map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-(--line) bg-(--panel) p-3"
                    >
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider text-(--gold)">
                        {label}
                      </span>
                      <p className="mt-0.5 text-xs font-semibold text-(--foreground)">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: High-Impact Product Showcase Card */}
          <Reveal delay={0.1} className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[2rem] border border-(--gold-line) bg-gradient-to-b from-(--gold-soft) via-(--panel) to-(--panel) p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(201,162,39,0.15)] sm:p-8">
              {/* Radial Sun Pulse Glow */}
              <div
                aria-hidden
                className="sun-pulse pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(240,217,135,0.45) 0%, rgba(201,162,39,0.2) 45%, transparent 70%)",
                }}
              />

              {/* Header on card */}
              <div className="relative z-10 flex items-center justify-between border-b border-(--line) pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-(--gold)">
                    <Sparkles className="h-3.5 w-3.5" />
                    Physical Finisher Medal
                  </span>
                  <p className="text-[0.65rem] text-(--muted)">Official Sports Day Celebration 2026</p>
                </div>
                {hasMedalImage && (
                  <button
                    type="button"
                    onClick={() => setIsInspectorOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3 py-1 text-[0.65rem] font-bold text-(--gold-deep) transition-colors hover:bg-(--gold)/25"
                  >
                    <ZoomIn className="h-3 w-3" />
                    4K Zoom
                  </button>
                )}
              </div>

              {/* Medal Display Area */}
              <div className="relative my-6 flex min-h-[300px] items-center justify-center">
                {hasMedalImage ? (
                  <div
                    onClick={() => setIsInspectorOpen(true)}
                    className="group relative cursor-pointer"
                  >
                    <div className="medal-float w-52 drop-shadow-[0_25px_40px_rgba(122,92,8,0.4)] transition-transform duration-500 group-hover:scale-105 sm:w-64">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={medalImg}
                        alt={`${eventName} Finisher Medal`}
                        className="h-auto w-full rounded-2xl object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                      />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
                        <ZoomIn className="h-4 w-4 text-(--gold)" />
                        Click to Inspect Engravings
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="medal-float relative flex aspect-[3/4] w-48 flex-col items-center justify-center overflow-hidden rounded-[3rem] border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md sm:w-56">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-tr from-transparent via-white/30 to-transparent" />
                    <Medal className="mb-3 h-16 w-16 text-white/50 drop-shadow-md" strokeWidth={1} />
                    <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">
                      Revealing Soon ✨
                    </span>
                  </div>
                )}
              </div>

              {/* Micro Perks Banner */}
              <div className="relative z-10 grid grid-cols-3 gap-2 border-t border-(--line) py-3 text-center">
                <div>
                  <p className="text-[0.65rem] font-bold text-(--foreground)">100% Metal</p>
                  <p className="text-[0.55rem] text-(--muted)">No Plastic</p>
                </div>
                <div className="border-x border-(--line)">
                  <p className="text-[0.65rem] font-bold text-(--foreground)">Free Courier</p>
                  <p className="text-[0.55rem] text-(--muted)">All India</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold text-(--foreground)">Dual Sided</p>
                  <p className="text-[0.55rem] text-(--muted)">Front & Back</p>
                </div>
              </div>

              {/* Card Footer Tag & Claim CTA */}
              <div className="relative z-10 border-t border-(--gold-line) pt-4 text-center">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--gold-deep)">
                  <Sparkles className="h-3.5 w-3.5" />
                  Complete Kit Worth ₹999+ · Included With Every Registration
                </p>
                <Link
                  className="btn btn-gold btn-full mt-3 gap-2 text-xs font-bold uppercase tracking-wider"
                  href={`/register?event=${encodeURIComponent(slug)}`}
                >
                  Claim Your Medal & Kit
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* 4K Medal Inspector Lightbox */}
      {hasMedalImage && (
        <MedalInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          imageUrl={medalImg!}
          eventName={eventName}
          slug={slug}
          price={price}
        />
      )}
    </section>
  );
}
