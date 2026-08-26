"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, IndianRupee, Users, BadgeCheck, MapPin, Sparkles, Medal } from "lucide-react";
import { getApiUrl } from "../../lib/api";
import { type ApiEvent, mapApiEventToPublic } from "../../lib/events-api";
import {
  pastEvents as staticPastEvents,
  publicEvents as staticUpcomingEvents,
  type PublicEvent,
} from "../data/events";

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function EventCard({ event, variant = "upcoming" }: { event: PublicEvent; variant?: "upcoming" | "past" }) {
  const isPast = variant === "past" || event.status === "past";
  const hasBannerImage = Boolean(event.bannerImageUrl);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#141419] shadow-lg transition-all duration-300 hover:border-(--gold-line)/60 hover:shadow-2xl">
      <Link
        href={`/events/${event.slug}`}
        className="flex flex-1 flex-col cursor-pointer"
      >
        <div className={`relative overflow-hidden ${hasBannerImage ? "min-h-44 bg-(--panel-soft)" : isPast ? "bg-(--panel-soft)" : "bg-linear-to-br from-emerald-800 to-indigo-900"}`}>
          {event.bannerImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${event.name} banner`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={event.bannerImageUrl}
            />
          ) : null}
          {hasBannerImage ? <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#141419] via-black/40 to-black/20" /> : null}
          <div className={`relative z-10 px-4 py-3 sm:px-5 sm:py-3.5 ${hasBannerImage ? "flex min-h-44 flex-col justify-between" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full bg-black/50 border border-white/20 px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-white backdrop-blur-md">
                {event.banner || "VIRTUAL RACE"}
              </span>
              {isPast ? (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-(--muted) backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--muted-soft)" />
                  Completed
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Registration
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-bold text-white drop-shadow-md">{event.reward}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 pb-0 sm:p-5 sm:pb-0">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[0.65rem] font-semibold text-(--muted)">
              <CalendarDays className="h-3.5 w-3.5 text-(--gold)" />
              {event.date}
            </span>
            <div className="flex items-baseline gap-1.5">
              {!isPast && (
                <span className="text-xs text-(--muted-soft) line-through font-mono">
                  ₹799
                </span>
              )}
              <span className="inline-flex items-center text-base font-black text-(--gold)">
                <IndianRupee className="h-4 w-4" />
                {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
              </span>
            </div>
          </div>

          <h3 className="mt-3 text-lg font-black tracking-tight text-white group-hover:text-(--gold) transition-colors">{event.name}</h3>
          
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {event.distance.split(",").map((d) => (
              <span
                key={d.trim()}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-400"
              >
                {d.trim()}
              </span>
            ))}
          </div>

          {event.medalImageUrl && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-(--gold-line)/40 bg-(--gold-soft) px-3 py-1.5 text-[0.68rem] font-black text-(--gold-deep)">
              <Medal className="h-4 w-4 shrink-0 text-(--gold)" />
              <span>Heavyweight 3D Medal + E-Certificate</span>
            </div>
          )}

          <p className="mt-2.5 flex-1 text-xs leading-relaxed text-(--muted)">{event.highlight}</p>

          {isPast && (event.finishers || event.cities) && (
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5">
              {[
                { label: "Finishers", value: event.finishers, icon: Users },
                { label: "Verified", value: event.verifiedResults, icon: BadgeCheck },
                { label: "Cities", value: event.cities, icon: MapPin },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto h-3.5 w-3.5 text-(--muted)" />
                  <p className="mt-0.5 text-sm font-black tracking-tight text-white">
                    {typeof value === "number" ? value.toLocaleString("en-IN") : "\u2014"}
                  </p>
                  <p className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-wider text-(--muted-soft)">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex gap-2">
        <Link className="btn btn-secondary flex-1 group/btn text-xs sm:text-sm font-bold" href={`/events/${event.slug}`}>
          <span>{isPast ? "View Recap" : "Details"}</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Link>
        {!isPast ? (
          <Link
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-(--gold) to-(--gold-deep) px-4 py-2.5 text-xs sm:text-sm font-black text-black shadow-md shadow-(--gold)/20 transition-all hover:scale-[1.02] active:scale-95"
            href={`/register?event=${encodeURIComponent(event.slug)}`}
          >
            <Medal className="h-3.5 w-3.5" />
            <span>Register (₹399)</span>
          </Link>
        ) : (
          <Link className="btn btn-primary flex-1 group/btn text-xs sm:text-sm" href="/leaderboard">
            Results
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

export function EventsCatalog({
  initialUpcoming,
  initialPast,
}: {
  initialUpcoming?: PublicEvent[];
  initialPast?: PublicEvent[];
} = {}) {
  const [upcoming, setUpcoming] = useState<PublicEvent[]>(
    initialUpcoming && initialUpcoming.length > 0 ? initialUpcoming : staticUpcomingEvents,
  );
  const [past, setPast] = useState<PublicEvent[]>(
    initialPast && initialPast.length > 0 ? initialPast : staticPastEvents,
  );

  useEffect(() => {
    // If we already have server-rendered upcoming events, no need to flash or re-fetch immediately on client
    if (initialUpcoming && initialUpcoming.length > 0) {
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(getApiUrl("/api/events?group=true"));
        if (!response.ok) return;
        const json = await response.json();
        const upcomingApi = (json.data?.upcoming ?? []) as ApiEvent[];
        const pastApi = (json.data?.past ?? []) as ApiEvent[];
        if (cancelled || (upcomingApi.length === 0 && pastApi.length === 0)) return;
        setUpcoming(upcomingApi.map((event) => mapApiEventToPublic(event, "upcoming")));
        setPast(pastApi.map((event) => mapApiEventToPublic(event, "past")));
      } catch {
        // keep static catalog
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [initialUpcoming]);

  return (
    <div className="min-w-0">
      {/* Upcoming events */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Live &amp; Upcoming Races
            </h2>
          </div>
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-(--gold)">
            {upcoming.length} Active {upcoming.length === 1 ? "Event" : "Events"}
          </span>
        </div>

        {upcoming.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <FadeIn key={event.slug} delay={i * 0.06}>
                <EventCard event={event} variant="upcoming" />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#131318] px-6 py-12 text-center">
            <Sparkles className="h-8 w-8 text-(--gold)" />
            <p className="mt-2 text-base font-bold text-white">No open events right now</p>
            <p className="mt-1 text-xs text-(--muted)">Check back soon for new race releases.</p>
          </div>
        )}
      </div>

      {/* Past events */}
      {past.length > 0 && (
        <div className="mt-14 border-t border-white/10 pt-10 sm:mt-16">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                Past Completed Races
              </h2>
              <p className="mt-1 text-xs text-(--muted)">
                Archived events and Hall of Fame. Tap any event to inspect finisher results.
              </p>
            </div>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-(--muted)">
              {past.length} Finished
            </span>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event, i) => (
              <FadeIn key={event.slug} delay={i * 0.06}>
                <EventCard event={event} variant="past" />
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
