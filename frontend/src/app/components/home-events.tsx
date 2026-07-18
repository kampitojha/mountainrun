"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PublicEvent } from "../data/events";
import { publicEvents as staticUpcoming } from "../data/events";
import { fetchOpenEvents } from "../../lib/events-api";
import { Stagger, StaggerItem } from "./marketing/motion";

function EventCard({ event }: { event: PublicEvent }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="event-card card-premium-glow flex flex-col overflow-hidden bg-(--panel) border border-(--line) rounded-(--radius) shadow-sm"
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
    >
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-teal-950 px-6 py-5 text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-teal-500/10 blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-400">
            {event.banner}
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            Active
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-100">{event.reward}</p>
      </div>
      
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="badge font-medium text-xs text-(--muted)">{event.date}</span>
          <span className="text-sm font-bold text-(--sage)">{event.price}</span>
        </div>
        <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground sm:text-xl transition-colors duration-300">
          {event.name}
        </h3>
        <p className="mt-1.5 text-xs font-medium text-(--muted-soft) tracking-wide uppercase">{event.distance}</p>
        <p className="mt-3.5 flex-1 text-sm leading-relaxed text-(--muted)">
          {event.highlight}
        </p>
        <Link
          className="btn btn-primary group mt-6 w-full cursor-pointer"
          href={`/events/${event.slug}`}
        >
          View event
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </motion.article>
  );
}

export function HomeEvents({ initial = staticUpcoming.slice(0, 3) }: { initial?: PublicEvent[] }) {
  const [events, setEvents] = useState<PublicEvent[]>(initial);

  useEffect(() => {
    let cancelled = false;
    // Admin “featured” events appear first on homepage open events.
    void fetchOpenEvents({ homeFeaturedFirst: true, limit: 3 }).then((list) => {
      if (!cancelled && list.length > 0) {
        setEvents(list);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Stagger className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3" delay={0.05}>
      {events.map((event) => (
        <StaggerItem key={event.slug}>
          <EventCard event={event} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
