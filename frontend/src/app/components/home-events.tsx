"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming } from "../data/events";
import { fetchOpenEvents } from "../../lib/events-api";

function EventCard({ event }: { event: PublicEvent }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-(--line) bg-(--panel) shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-(--sage)/30 hover:shadow-lg">
      <div className="relative overflow-hidden bg-gradient-to-br from-(--sage) to-emerald-600">
        <div className="relative z-10 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 flex-1 text-[0.6rem] font-semibold uppercase tracking-widest text-white/70 leading-snug">
              {event.banner}
            </p>
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              Active
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-white/80 leading-snug">{event.reward}</p>
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel-soft) px-2.5 py-1 text-[0.6rem] font-medium text-(--muted)">
            <CalendarDays className="h-3 w-3 text-(--muted-soft)" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-(--sage)">
            <IndianRupee className="h-3.5 w-3.5" />
            {event.price.replace(/^Rs\.\s*/, "").replace(/^₹/, "")}
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold tracking-tight text-(--foreground) group-hover:text-(--sage) transition-colors sm:text-lg">
          {event.name}
        </h3>
        <p className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted-soft)">
          {event.distance}
        </p>

        {event.activityTypes && event.activityTypes.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {event.activityTypes.map((type) => (
              <span key={type}
                className="rounded-md border border-(--line) bg-(--panel) px-2 py-0.5 text-[0.6rem] font-semibold capitalize text-(--muted)">
                {type}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-2.5 flex-1 text-xs leading-relaxed text-(--muted) sm:text-sm">
          {event.highlight}
        </p>

        <Link className="btn btn-primary mt-4 w-full group/btn text-sm" href={`/events/${event.slug}`}>
          View event
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
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
