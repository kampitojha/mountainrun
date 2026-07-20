"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Target, IndianRupee, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming } from "../data/events";
import { fetchOpenEvents } from "../../lib/events-api";

const activityEmojis: Record<string, string> = {
  running: "\u{1F3C3}",
  cycling: "\u{1F6B4}",
  walking: "\u{1F6B6}",
};

function EventCard({ event }: { event: PublicEvent }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-(--line) bg-(--panel) shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Banner */}
      <div className="bg-(--sage) px-5 py-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-widest text-white/70 leading-snug">
            {event.banner}
          </p>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Active
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-white/80 leading-snug">{event.reward}</p>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel-soft) px-3 py-1 text-xs font-medium text-(--muted)">
            <CalendarDays className="h-3 w-3 text-(--muted-soft)" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-(--sage)">
            <IndianRupee className="h-3.5 w-3.5" />
            {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold tracking-tight text-(--foreground)">
          {event.name}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-(--muted-soft)">
          {event.distance}
        </p>

        {/* Activity types */}
        {event.activityTypes && event.activityTypes.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {event.activityTypes.map((type) => (
              <span key={type}
                className="inline-flex items-center gap-1 rounded-md border border-(--line) bg-(--panel) px-2 py-0.5 text-[0.65rem] font-semibold capitalize text-(--muted)">
                <span>{activityEmojis[type] ?? ""}</span>
                {type}
              </span>
            ))}
          </div>
        ) : null}

        {/* Coupon */}
        {event.couponCode && event.showCouponOnCard ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-(--line) bg-(--sage-soft) px-2.5 py-1.5 text-xs font-semibold text-(--sage)">
            <Sparkles className="h-3 w-3" />
            <span>Coupon:</span>
            <code className="tracking-wider">{event.couponCode}</code>
          </div>
        ) : null}

        <p className="mt-3 flex-1 text-sm leading-relaxed text-(--muted)">
          {event.highlight}
        </p>

        <Link className="btn btn-primary mt-5 w-full" href={`/events/${event.slug}`}>
          View event
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function HomeEvents({ initial = staticUpcoming.slice(0, 3) }: { initial?: PublicEvent[] }) {
  const [events, setEvents] = useState<PublicEvent[]>(initial);

  useEffect(() => {
    let cancelled = false;
    void fetchOpenEvents({ homeFeaturedFirst: true, limit: 3 }).then((list) => {
      if (!cancelled && list.length > 0) setEvents(list);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.slug} event={event} />
      ))}
    </div>
  );
}
