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

const activityEmojis: Record<string, string> = {
  running: "\u{1F3C3}",
  cycling: "\u{1F6B4}",
  walking: "\u{1F6B6}",
};

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

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-(--line) bg-(--panel) transition-all duration-300 hover:border-(--sage)/30 hover:shadow-lg">
      {/* Banner */}
      <div className={`relative overflow-hidden ${isPast ? "bg-(--panel-soft)" : "bg-gradient-to-br from-(--sage) to-emerald-600"}`}>
        <div className="relative z-10 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-[0.6rem] font-semibold uppercase tracking-widest ${isPast ? "text-(--muted)" : "text-white/70"}`}>
              {event.banner}
            </p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
              isPast
                ? "bg-(--sage-soft) text-(--sage)"
                : "bg-white/20 text-white backdrop-blur-sm"
            }`}>
              {isPast ? "Completed" : "Open"}
            </span>
          </div>
          <p className={`mt-1.5 text-xs font-medium ${isPast ? "text-(--muted)" : "text-white/80"}`}>{event.reward}</p>
        </div>
        {!isPast && <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-(--line) bg-(--panel-soft) px-2 py-1 text-[0.6rem] font-medium text-(--muted)">
            <CalendarDays className="h-3 w-3 text-(--muted-soft)" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-(--sage)">
            <IndianRupee className="h-3.5 w-3.5" />
            {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold tracking-tight text-(--foreground) group-hover:text-(--sage) transition-colors sm:text-lg">{event.name}</h3>
        <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-(--muted-soft)">{event.distance}</p>

        {event.activityTypes && event.activityTypes.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {event.activityTypes.map((type) => (
              <span key={type}
                className="inline-flex items-center gap-1 rounded-md border border-(--line) bg-(--panel) px-2 py-0.5 text-[0.6rem] font-semibold capitalize text-(--muted)">
                <span>{activityEmojis[type] ?? ""}</span>
                {type}
              </span>
            ))}
          </div>
        )}

        {event.couponCode && event.showCouponOnCard && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-(--sage)/20 bg-(--sage-soft) px-2.5 py-1.5 text-[0.65rem] font-semibold text-(--sage)">
            <Sparkles className="h-3 w-3" />
            <span>Coupon:</span>
            <code className="tracking-wider">{event.couponCode}</code>
          </div>
        )}

        <p className="mt-2.5 flex-1 text-xs leading-relaxed text-(--muted) sm:text-sm">{event.highlight}</p>

        {isPast && (event.finishers || event.cities) && (
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-(--line) bg-(--panel-soft) p-2.5 sm:p-3">
            {[
              { label: "Finishers", value: event.finishers, icon: Users },
              { label: "Verified", value: event.verifiedResults, icon: BadgeCheck },
              { label: "Cities", value: event.cities, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="mx-auto h-3 w-3 text-(--muted-soft)" />
                <p className="mt-0.5 text-sm font-bold tracking-tight text-(--foreground)">
                  {typeof value === "number" ? value.toLocaleString("en-IN") : "\u2014"}
                </p>
                <p className="mt-0.5 text-[0.5rem] uppercase tracking-wider text-(--muted-soft)">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Link className="btn btn-primary flex-1 group/btn text-sm" href={`/events/${event.slug}`}>
            <span>{isPast ? "View recap" : "Details"}</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>
          {!isPast ? (
            <Link className="btn btn-secondary flex-1 group/btn text-sm" href={`/register?event=${encodeURIComponent(event.slug)}`}>
              <Medal className="h-3.5 w-3.5" />
              Register
            </Link>
          ) : (
            <Link className="btn btn-secondary flex-1 group/btn text-sm" href="/leaderboard">
              Results
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function EventsCatalog() {
  const [upcoming, setUpcoming] = useState<PublicEvent[]>(staticUpcomingEvents);
  const [past, setPast] = useState<PublicEvent[]>(staticPastEvents);
  const [source, setSource] = useState<"api" | "static">("static");

  useEffect(() => {
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
        setSource("api");
      } catch {
        // keep static catalog
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-w-0">
      {/* Upcoming events */}
      <div className="mt-6 sm:mt-8">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Open now</p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">Upcoming events</h2>
          </div>
          <p className="shrink-0 text-xs text-(--muted)">
            {upcoming.length} race{upcoming.length === 1 ? "" : "s"}
            {source === "api" ? " \u00B7 live" : ""}
          </p>
        </div>

        {upcoming.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <FadeIn key={event.slug} delay={i * 0.06}>
                <EventCard event={event} variant="upcoming" />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-(--panel) px-6 py-10 text-center">
            <Sparkles className="h-7 w-7 text-(--muted-soft)" />
            <p className="mt-2 text-sm font-semibold text-(--foreground)">No open events right now</p>
            <p className="mt-0.5 text-xs text-(--muted)">Check back soon for new races.</p>
          </div>
        )}
      </div>

      {/* Past events */}
      {past.length > 0 && (
        <div className="mt-12 border-t border-(--line) pt-8 sm:mt-14 sm:pt-10">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="eyebrow">Archive</p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">Past events</h2>
            </div>
            <p className="shrink-0 text-xs text-(--muted)">
              {past.length} completed race{past.length === 1 ? "" : "s"}
            </p>
          </div>

          <p className="lede mt-2 max-w-xl text-xs sm:text-sm">
            Races that have already finished. Tap any event to see distances, rewards, and verified results.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
