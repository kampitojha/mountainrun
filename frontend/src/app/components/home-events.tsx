"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  Flame,
  Medal,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming } from "../data/events";

// Deterministic realistic slot scarcity calculation based on event slug & date
function getEventScarcity(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const percent = 78 + (positive % 18); // 78% to 95% booked
  const bibsLeft = 14 + (positive % 32); // 14 to 45 bibs left
  return { percent, bibsLeft };
}

function EventCard({ event, index }: { event: PublicEvent; index: number }) {
  const hasBannerImage = Boolean(event.bannerImageUrl);
  const scarcity = useMemo(() => getEventScarcity(event.slug), [event.slug]);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14 + (index * 6) % 24,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-(--line) bg-(--panel) shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-(--sage)/40 hover:shadow-xl"
    >
      <Link
        href={`/events/${event.slug}`}
        className="flex flex-1 flex-col cursor-pointer"
      >
        {/* Banner / Poster */}
        <div
          className={`relative overflow-hidden ${
            hasBannerImage ? "min-h-44 bg-(--panel-soft)" : "min-h-44 bg-linear-to-br from-(--sage) to-emerald-600"
          }`}
        >
          {event.bannerImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${event.name} banner`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={event.bannerImageUrl}
            />
          ) : null}
          {hasBannerImage ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent"
            />
          ) : null}

          {/* Top Badges */}
          <div className="relative z-10 p-4 flex items-start justify-between gap-2">
            {/* Live Pulsating Scarcity Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider text-slate-950 shadow-md">
              <Flame className="h-3 w-3 animate-bounce" />
              <span>{scarcity.percent}% Booked</span>
            </span>

            {/* Registration Live Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider text-white shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              <span>Active Challenge</span>
            </span>
          </div>

          {/* Reward / Medal Highlight Strip */}
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white drop-shadow-md">
              <Medal className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="truncate">{event.reward}</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Scarcity Progress Bar */}
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-[0.68rem]">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Only {scarcity.bibsLeft} Bibs Remaining
              </span>
              <span className="text-(--muted) font-mono">
                {scarcity.percent}% filled
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-(--panel-soft) p-0.5 border border-(--line)">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${scarcity.percent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-linear-to-r from-emerald-500 via-amber-500 to-amber-600"
              />
            </div>
          </div>

          {/* Title & Distance */}
          <h3 className="text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-(--sage)">
            {event.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {event.distance.split(",").map((d) => (
              <span
                key={d}
                className="rounded-lg bg-(--sage-soft) border border-(--sage)/20 px-2 py-0.5 font-mono text-[0.65rem] font-bold text-(--sage)"
              >
                {d.trim()}
              </span>
            ))}
          </div>

          <p className="mt-3 flex-1 text-xs leading-relaxed text-(--muted) line-clamp-2">
            {event.highlight}
          </p>

          {/* Countdown & Price Footer */}
          <div className="mt-4 pt-4 border-t border-(--line) flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[0.7rem] text-(--muted) font-medium">
              <Timer className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Closes in:</span>
              <span className="font-mono font-bold text-foreground">
                {timeLeft.hours}h {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
            </div>

            <div className="text-right">
              <span className="font-mono text-base font-black text-foreground">
                {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "₹")}
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <div
            className="btn btn-primary mt-4 w-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-(--sage)/15 group-hover:shadow-lg transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Claim Your Bib & Medal</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function HomeEvents({ initial = staticUpcoming.slice(0, 3) }: { initial?: PublicEvent[] }) {
  const events = initial;

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, i) => (
        <EventCard key={event.slug} event={event} index={i} />
      ))}
    </div>
  );
}
