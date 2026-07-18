"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { type ApiEvent, mapApiEventToPublic } from "../../lib/events-api";
import {
  pastEvents as staticPastEvents,
  publicEvents as staticUpcomingEvents,
  type PublicEvent,
} from "../data/events";

function EventCard({
  event,
  variant = "upcoming",
}: {
  event: PublicEvent;
  variant?: "upcoming" | "past";
}) {
  const isPast = variant === "past" || event.status === "past";

  return (
    <article className={`card card-hover flex flex-col overflow-hidden ${isPast ? "opacity-95" : ""}`}>
      <div className={`event-card-banner px-6 py-4 text-white ${isPast ? "!bg-[var(--sage)]" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
            {event.banner}
          </p>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white">
            {isPast ? "Completed" : "Open"}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium">{event.reward}</p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="badge">{event.date}</span>
          <span className="text-sm font-semibold tracking-tight">{event.price}</span>
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight">{event.name}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{event.distance}</p>
        <p className="mt-4 flex-1 text-sm leading-6 text-[var(--muted)]">{event.highlight}</p>

        {isPast && (event.finishers || event.cities) ? (
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-3">
            {[
              ["Finishers", event.finishers],
              ["Verified", event.verifiedResults],
              ["Cities", event.cities],
            ].map(([label, value]) => (
              <div key={String(label)} className="text-center">
                <p className="text-sm font-semibold tracking-tight">
                  {typeof value === "number" ? value.toLocaleString("en-IN") : "—"}
                </p>
                <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-[var(--muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 grid gap-2">
          <Link className="btn btn-primary" href={`/events/${event.slug}`}>
            {isPast ? "View recap" : "View details"}
          </Link>
          {!isPast ? (
            <Link className="btn btn-secondary" href="/register">
              Register
            </Link>
          ) : (
            <Link className="btn btn-secondary" href="/leaderboard">
              View leaderboard
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
        if (!response.ok) {
          return;
        }
        const json = await response.json();
        const upcomingApi = (json.data?.upcoming ?? []) as ApiEvent[];
        const pastApi = (json.data?.past ?? []) as ApiEvent[];

        if (cancelled || (upcomingApi.length === 0 && pastApi.length === 0)) {
          return;
        }

        setUpcoming(upcomingApi.map((event) => mapApiEventToPublic(event, "upcoming")));
        setPast(pastApi.map((event) => mapApiEventToPublic(event, "past")));
        setSource("api");
      } catch {
        // keep static catalog
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="mt-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Open now</p>
            <h2 className="heading mt-2">Upcoming events</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {upcoming.length} race{upcoming.length === 1 ? "" : "s"} open for registration
            {source === "api" ? " · live from API" : ""}
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard event={event} key={event.slug} variant="upcoming" />
          ))}
        </div>
      </div>

      <div className="mt-20 border-t border-[var(--line)] pt-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Archive</p>
            <h2 className="heading mt-2">Past events</h2>
            <p className="lede mt-3 max-w-xl">
              Races that have already finished. Tap any event to see distances, rewards, and how
              it went.
            </p>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {past.length} completed race{past.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {past.map((event) => (
            <EventCard event={event} key={event.slug} variant="past" />
          ))}
        </div>
      </div>
    </>
  );
}
