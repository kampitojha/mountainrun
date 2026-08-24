"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  FileBadge,
  Medal,
  Route,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Truck,
} from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { Breadcrumb } from "../../components/breadcrumb";
import { RegisterCta } from "../../components/register-cta";
import { EventCountdown } from "./countdown";
import { Medal3D } from "./medal";

const rewardBadges = [
  { icon: Medal, label: "Finisher Medal" },
  { icon: Shirt, label: "Premium T-shirt" },
  { icon: FileBadge, label: "Official Certificate" },
  { icon: Truck, label: "Free Delivery" },
  { icon: Trophy, label: "Hall of Fame" },
];

export function EventHero({ event, isPast }: { event: PublicEvent; isPast: boolean }) {
  const distances = event.distance.split(" / ");
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
            "radial-gradient(ellipse 90% 60% at 50% -10%, color-mix(in srgb, var(--gold) 9%, transparent) 0%, transparent 55%)",
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

        {/* ─── Headline block ─── */}
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

        {/* ─── Real Runners Proof ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4"
        >
          <div className="flex -space-x-3">
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
                alt="Runner"
                className="h-10 w-10 rounded-full border-2 border-(--background) object-cover shadow-sm sm:h-12 sm:w-12"
              />
            ))}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold tracking-tight text-(--foreground) sm:text-base">
              25,000+ real runners joined
            </p>
            <p className="text-xs text-(--muted) sm:text-sm">
              From Kashmir to Kanyakumari
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
