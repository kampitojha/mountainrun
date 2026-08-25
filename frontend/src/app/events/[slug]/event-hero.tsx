"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  CalendarDays,
  FileBadge,
  Medal,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Truck,
  ZoomIn,
} from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { Breadcrumb } from "../../components/breadcrumb";
import { RegisterCta } from "../../components/register-cta";
import { EventCountdown } from "./countdown";
import { MedalInspectorModal } from "./medal-inspector-modal";

const rewardBadges = [
  { icon: Medal, label: "Finisher Medal" },
  { icon: Shirt, label: "Premium T-shirt" },
  { icon: FileBadge, label: "Official Certificate" },
  { icon: Truck, label: "Free Delivery" },
  { icon: Trophy, label: "Leaderboard" },
];

export function EventHero({ event, isPast }: { event: PublicEvent; isPast: boolean }) {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const medalImg = event.medalImageUrl || (event.slug === "sports-day-celebration" ? "/images/sports-day-medal.jpg" : undefined);
  const hasMedalImage = Boolean(medalImg);

  const priceLabel =
    event.price.toLowerCase().includes("free")
      ? "Register now"
      : `Register now — ${event.price.replace(/^Rs\.\s*/, "₹")}`;

  return (
    <section className="relative overflow-hidden border-b border-(--line)">
      <div className="hero-mesh-bg" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 90% 60% at 50% -10%, color-mix(in srgb, var(--gold) 12%, transparent) 0%, transparent 55%)",
            "radial-gradient(ellipse 60% 50% at 100% 20%, color-mix(in srgb, var(--sage) 8%, transparent) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <div className="container-page pb-16 pt-5 sm:pt-7">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Events", href: "/events" },
            { name: event.name, href: `/events/${event.slug}` },
          ]}
        />

        {hasMedalImage && !isPast ? (
          /* ─── Premium Split Hero Layout (Featured Medal Showcase) ─── */
          <div className="mt-8 grid items-center gap-8 sm:mt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            {/* Left Column: Event Details & Action */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <p className="inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-(--gold-deep) shadow-sm sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-(--gold-deep)" />
                  National Sports Day 2026 Virtual Run
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-(--line) bg-(--panel-soft) px-3 py-1 text-[0.65rem] font-semibold text-(--muted)">
                  <CalendarDays className="h-3 w-3 text-(--sage)" />
                  {event.date}
                </span>
              </div>

              <h1 className="mt-4 text-[2.25rem] font-black leading-[1.06] tracking-tight text-(--foreground) sm:text-5xl lg:text-[3.5rem]">
                <span className="text-gradient-premium block">{event.name}</span>
              </h1>

              <p className="lede mt-4 max-w-xl text-sm leading-relaxed sm:text-lg lg:max-w-none">
                Run anywhere. Your pace. Your proof.
                <br className="hidden sm:block" />
                Finish your distance and claim India&rsquo;s most prestigious heavyweight 3D finisher medal!
              </p>

              {/* Price & Early Bird Banner */}
              <div className="mt-5 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-(--foreground) sm:text-3xl">
                    {event.price.replace(/^Rs\.\s*/, "₹")}
                  </span>
                  {event.compareAtPrice && (
                    <span className="text-sm font-semibold text-(--muted) line-through">
                      {event.compareAtPrice.replace(/^Rs\.\s*/, "₹")}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-(--gold-soft) px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-(--gold-deep)">
                  <Sparkles className="h-3 w-3" />
                  All-Inclusive Finisher Kit
                </span>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <RegisterCta
                  className="btn-gold !py-3 !px-6 text-sm font-extrabold rounded-xl shadow-lg shadow-(--gold)/15 hover:shadow-(--gold)/30 transition-all text-center justify-center"
                  signedInLabel="Register now"
                  signedOutLabel="Register now"
                  slug={event.slug}
                />
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(true)}
                  className="btn btn-secondary !py-3 !px-5 inline-flex items-center justify-center gap-2 text-sm font-bold rounded-xl border border-white/10 hover:border-(--gold-line) transition-colors"
                >
                  <ZoomIn className="h-4 w-4 text-(--gold)" />
                  See your medal
                </button>
              </div>

              {/* Urgency countdown if endsAt */}
              {event.endsAt ? (
                <div className="mt-4 flex justify-center lg:justify-start">
                  <span className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-(--foreground)">
                    <EventCountdown targetDate={event.endsAt} compact />
                  </span>
                </div>
              ) : null}

              {/* Trust perks row */}
              <div className="mt-6 grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
                {[
                  { icon: Award, label: "Solid Heavy Metal", sub: "3D Antique Gold" },
                  { icon: Truck, label: "Free Shipping", sub: "Pan-India Delivery" },
                  { icon: FileBadge, label: "Official Certificate", sub: "Verified Finish" },
                  { icon: ShieldCheck, label: "GPS Proof Check", sub: "Strava / Any App" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col rounded-xl border border-(--line) bg-(--panel-soft)/60 p-2.5 backdrop-blur-xs"
                  >
                    <div className="flex items-center gap-1.5 text-(--gold)">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-[0.7rem] font-bold text-(--foreground)">{label}</span>
                    </div>
                    <span className="mt-0.5 text-[0.6rem] text-(--muted)">{sub}</span>
                  </div>
                ))}
              </div>

              {/* Real runners proof */}
              <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex -space-x-2.5">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80",
                  ].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt="Runner avatar"
                      className="h-8 w-8 rounded-full border-2 border-(--background) object-cover shadow-sm"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-(--muted)">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-(--gold) text-(--gold)" />
                    ))}
                  </div>
                  <span>25,000+ finishers across India</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Ultra-Premium Finisher Medal Showcase Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              {/* Pulsing Golden Aura Glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[2.5rem] opacity-70 blur-2xl transition-all duration-700 sm:-inset-6"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(226, 185, 63, 0.35) 0%, rgba(201, 162, 39, 0.15) 50%, transparent 75%)",
                }}
              />

              {/* Showcase Card Shell */}
              <div className="group relative overflow-hidden rounded-3xl border border-(--gold-line) bg-gradient-to-b from-[#181820] via-[#121216] to-[#0d0d10] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(201,162,39,0.18)] sm:p-8">
                {/* Header ribbon on card */}
                <div className="flex items-center justify-between border-b border-(--line) pb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-(--gold)">
                    <Award className="h-4 w-4" />
                    Official Finisher Medal
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-(--panel-soft) px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-(--muted)">
                    Delivered to Doorstep
                  </span>
                </div>

                {/* Main Medal Centerpiece with Interactive Hover & Zoom Trigger */}
                <div
                  onClick={() => setIsInspectorOpen(true)}
                  className="relative my-4 flex cursor-pointer items-center justify-center py-2"
                >
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative transition-transform duration-500 group-hover:scale-105"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={medalImg}
                      alt={`${event.name} Finisher Medal`}
                      className="max-h-[340px] w-auto max-w-full rounded-2xl object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                    />

                    {/* Magnifier Hover Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
                        <ZoomIn className="h-4 w-4 text-(--gold)" />
                        Click to Inspect 4K Detail
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Micro Details Badge Strip */}
                <div className="grid grid-cols-2 gap-2 border-t border-(--line) pt-4 text-center">
                  <div className="rounded-xl border border-(--line) bg-(--panel-soft) p-2">
                    <p className="text-[0.65rem] font-black uppercase tracking-wider text-(--gold)">
                      3D High Relief
                    </p>
                    <p className="mt-0.5 text-[0.6rem] text-(--muted)">
                      Sculpted Athletes & Peaks
                    </p>
                  </div>
                  <div className="rounded-xl border border-(--line) bg-(--panel-soft) p-2">
                    <p className="text-[0.65rem] font-black uppercase tracking-wider text-(--gold)">
                      Reverse Engraved
                    </p>
                    <p className="mt-0.5 text-[0.6rem] text-(--muted)">
                      Laurel & Legacy Quote
                    </p>
                  </div>
                </div>

                {/* Bottom inspect action banner */}
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(true)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-(--gold-line)/50 bg-(--gold-soft) py-2 text-xs font-bold text-(--gold-deep) transition-colors hover:bg-(--gold)/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Tap to view Front & Back 4K engravings
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ─── Standard Centered Hero Layout ─── */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-center sm:mt-12"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-(--gold-deep) shadow-sm sm:text-xs">
              <Sparkles className="h-3 w-3" />
              India&rsquo;s premium virtual run
            </p>

            <h1 className="mt-5 text-[2rem] font-black leading-[1.05] tracking-tight text-(--foreground) sm:text-5xl lg:text-6xl">
              <span className="block">{isPast ? "The" : "India's Premium"}</span>
              <span className="text-gradient-premium block">{event.name}</span>
            </h1>

            <p className="lede mx-auto mt-4 max-w-xl px-2 text-sm sm:mt-6 sm:text-lg">
              Run anywhere. Your pace. Your proof.
              <br className="hidden sm:block" /> Finish with pride — and a medal you&rsquo;ll never take off.
            </p>

            {/* Rating */}
            <div className="mt-5 flex items-center justify-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-(--gold) text-(--gold)" />
                ))}
              </div>
              <p className="text-xs font-semibold text-(--muted) sm:text-sm">
                Trusted by runners across India
              </p>
            </div>

            {/* CTAs */}
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
              <RegisterCta
                className="sm:min-w-56"
                signedInLabel="Register now"
                signedOutLabel={priceLabel}
                slug={event.slug}
              />
              <Link
                className="btn btn-secondary gap-2 text-sm"
                href="#rewards"
                scroll
              >
                See rewards
              </Link>
            </div>

            {!isPast && event.endsAt ? (
              <div className="mt-5 flex justify-center">
                <span className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-(--foreground)">
                  <EventCountdown targetDate={event.endsAt} compact />
                </span>
              </div>
            ) : null}

            {/* Floating reward badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {rewardBadges.map(({ icon: Icon, label }, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                  className="badge-float glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold text-(--foreground) shadow-sm"
                  style={{ animationDelay: `${i * 0.55}s`, ["--tilt" as string]: `${i % 2 === 0 ? -3 : 3}deg` }}
                >
                  <Icon className="h-3.5 w-3.5 text-(--gold-deep)" />
                  {label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 4K Medal Inspector Modal */}
      {medalImg && (
        <MedalInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          imageUrl={medalImg}
          eventName={event.name}
          slug={event.slug}
          price={event.price.replace(/^Rs\.\s*/, "₹")}
        />
      )}
    </section>
  );
}
