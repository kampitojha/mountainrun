"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming } from "../data/events";
import { fetchOpenEvents } from "../../lib/events-api";

export function HomeEvents({ initial = staticUpcoming.slice(0, 3) }: { initial?: PublicEvent[] }) {
  const [events, setEvents] = useState<PublicEvent[]>(initial);

  useEffect(() => {
    let cancelled = false;
    void fetchOpenEvents().then((list) => {
      if (!cancelled && list.length > 0) {
        setEvents(list.slice(0, 3));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
      {events.map((event) => (
        <article className="card card-hover flex flex-col overflow-hidden" key={event.slug}>
          <div className="bg-[var(--foreground)] px-5 py-4 text-white sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
              {event.banner}
            </p>
            <p className="mt-2 text-sm font-medium">{event.reward}</p>
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="badge">{event.date}</span>
              <span className="text-sm font-medium tracking-tight">{event.price}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight sm:mt-6 sm:text-xl">
              {event.name}
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{event.distance}</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)] sm:mt-4">
              {event.highlight}
            </p>
            <Link className="btn btn-primary mt-5 w-full sm:mt-6" href={`/events/${event.slug}`}>
              View event
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
