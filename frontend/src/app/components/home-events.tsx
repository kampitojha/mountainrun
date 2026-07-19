"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming } from "../data/events";
import { fetchOpenEvents } from "../../lib/events-api";

function EventCard({ event }: { event: PublicEvent }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-(--line) bg-(--panel)">
      {/* Dark banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 px-5 py-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-widest text-teal-400 leading-snug">
            {event.banner}
          </p>
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-400">
            Active
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-slate-200 leading-snug">{event.reward}</p>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-(--line) bg-(--panel-soft) px-3 py-1 text-xs font-medium text-(--muted)">
            {event.date}
          </span>
          <span className="text-sm font-bold text-(--sage)">{event.price}</span>
        </div>

        <h3 className="mt-4 text-lg font-bold tracking-tight text-(--foreground)">
          {event.name}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-(--muted-soft)">
          {event.distance}
        </p>
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
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.slug} event={event} />
      ))}
    </div>
  );
}
