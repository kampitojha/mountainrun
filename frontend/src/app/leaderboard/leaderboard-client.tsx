"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { publicEvents } from "../data/events";

export type LeaderboardEntry = {
  rank: number;
  runnerName: string;
  distance: string;
  finishTimeSeconds: number | null;
  bibNumber: string;
  userId?: string;
  clerkId?: string | null;
  status: string;
};

type EventOption = {
  id?: string;
  slug: string;
  name: string;
  distances?: string[];
};

const DEMO_ENTRIES: LeaderboardEntry[] = [
  {
    rank: 1,
    runnerName: "Aarav Sharma",
    distance: "21 km",
    finishTimeSeconds: 6138,
    bibNumber: "MR-2101",
    status: "Verified",
  },
  {
    rank: 2,
    runnerName: "Nisha Rawat",
    distance: "10 km",
    finishTimeSeconds: 2942,
    bibNumber: "MR-1044",
    status: "Verified",
  },
  {
    rank: 3,
    runnerName: "Kabir Sethi",
    distance: "10 km",
    finishTimeSeconds: 3104,
    bibNumber: "MR-1088",
    status: "Verified",
  },
  {
    rank: 4,
    runnerName: "Meera Joshi",
    distance: "5 km",
    finishTimeSeconds: 1459,
    bibNumber: "MR-0521",
    status: "Verified",
  },
  {
    rank: 5,
    runnerName: "Rohan Kapoor",
    distance: "21 km",
    finishTimeSeconds: 6535,
    bibNumber: "MR-2112",
    status: "Verified",
  },
  {
    rank: 6,
    runnerName: "Ananya Iyer",
    distance: "5 km",
    finishTimeSeconds: 1571,
    bibNumber: "MR-0533",
    status: "Verified",
  },
  {
    rank: 7,
    runnerName: "Dev Malhotra",
    distance: "10 km",
    finishTimeSeconds: 3288,
    bibNumber: "MR-1099",
    status: "Verified",
  },
  {
    rank: 8,
    runnerName: "Isha Verma",
    distance: "21 km",
    finishTimeSeconds: 7020,
    bibNumber: "MR-2140",
    status: "Verified",
  },
];

function formatTime(seconds: number | null | undefined) {
  if (seconds == null || Number.isNaN(seconds)) {
    return "—";
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}


function YourRankCard({
  entry,
  eventTitle,
  total,
}: {
  entry: LeaderboardEntry;
  eventTitle: string;
  total: number;
}) {
  return (
    <div className="card mt-10 overflow-hidden border-[var(--foreground)] bg-[var(--foreground)] p-0 text-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
            Your position
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Rank #{entry.rank}
            <span className="ml-2 text-base font-medium text-white/60">of {total}</span>
          </p>
          <p className="mt-2 text-sm text-white/70">
            {entry.runnerName} · {entry.distance} · {formatTime(entry.finishTimeSeconds)} · {eventTitle}
          </p>
        </div>
        <div className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
          That&apos;s you
        </div>
      </div>
    </div>
  );
}

export function LeaderboardClient() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const currentClerkId = user?.id ?? null;

  const [events, setEvents] = useState<EventOption[]>(
    publicEvents.map((e) => ({ slug: e.slug, name: e.name })),
  );
  const [selectedSlug, setSelectedSlug] = useState(publicEvents[0]?.slug ?? "");
  const [distance, setDistance] = useState<string>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [eventTitle, setEventTitle] = useState(publicEvents[0]?.name ?? "Leaderboard");
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distanceOptions = useMemo(() => {
    const fromApi = events.find((e) => e.slug === selectedSlug)?.distances;
    if (fromApi?.length) {
      return fromApi;
    }
    const pub = publicEvents.find((e) => e.slug === selectedSlug);
    if (pub?.distance) {
      return pub.distance.split("/").map((d) => d.trim()).filter(Boolean);
    }
    return ["5 km", "10 km", "21 km"];
  }, [events, selectedSlug]);

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/api/events"));
      if (!response.ok) {
        return;
      }
      const json = await response.json();
      const list = (json.data ?? []) as Array<{
        id: string;
        slug: string;
        title: string;
        distances: string[];
      }>;
      if (list.length > 0) {
        setEvents(
          list.map((e) => ({
            id: e.id,
            slug: e.slug,
            name: e.title,
            distances: e.distances,
          })),
        );
        setSelectedSlug((prev) => prev || list[0].slug);
      }
    } catch {
      // keep publicEvents fallback
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    if (!selectedSlug) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = distance !== "all" ? `?distance=${encodeURIComponent(distance)}` : "";
      const response = await fetch(
        getApiUrl(`/api/registrations/leaderboard/${selectedSlug}${query}`),
      );

      if (!response.ok) {
        throw new Error("Could not load leaderboard");
      }

      const json = await response.json();
      const rows = (json.data ?? []) as LeaderboardEntry[];
      const title = json.meta?.eventTitle as string | undefined;

      if (title) {
        setEventTitle(title);
      } else {
        const match = events.find((e) => e.slug === selectedSlug);
        setEventTitle(match?.name ?? "Leaderboard");
      }

      if (rows.length === 0) {
        // Demo board so UI still feels complete; inject "you" if signed in
        let demo = DEMO_ENTRIES.map((row) => ({ ...row }));
        if (isSignedIn && currentClerkId) {
          const youName = user?.fullName || user?.firstName || "You";
          demo = [
            ...demo.slice(0, 4),
            {
              rank: 5,
              runnerName: youName,
              distance: distance !== "all" ? distance : "10 km",
              finishTimeSeconds: 3400,
              bibNumber: "MR-YOU",
              clerkId: currentClerkId,
              status: "Verified",
            },
            ...demo.slice(4),
          ]
            .map((row, i) => ({ ...row, rank: i + 1 }))
            .slice(0, 8);
        }
        setEntries(demo);
        setUsingDemo(true);
      } else {
        setEntries(rows);
        setUsingDemo(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      // Fallback demo
      setEntries(DEMO_ENTRIES);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, [currentClerkId, distance, events, isSignedIn, selectedSlug, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEvents();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLeaderboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadLeaderboard]);

  const yourEntry = useMemo(() => {
    if (!currentClerkId) {
      return null;
    }
    return entries.find((e) => e.clerkId === currentClerkId) ?? null;
  }, [currentClerkId, entries]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">Rankings</p>
          <h1 className="display mt-3">Leaderboard</h1>
          <p className="lede mt-3">
            Approved GPS proofs only. If you&apos;re logged in, we highlight <span className="font-medium text-[var(--foreground)]">You</span>.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-[1fr_9rem]">
        <label className="block min-w-0 text-sm">
          <span className="field-label">Event</span>
          <select
            className="input"
            onChange={(e) => {
              setSelectedSlug(e.target.value);
              setDistance("all");
            }}
            value={selectedSlug}
          >
            {events.map((event) => (
              <option key={event.slug} value={event.slug}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 text-sm">
          <span className="field-label">Distance</span>
          <select
            className="input"
            onChange={(e) => setDistance(e.target.value)}
            value={distance}
          >
            <option value="all">All</option>
            {distanceOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {usingDemo ? (
        <p className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--muted)]">
          Showing sample rankings until approved proofs appear for this event.
          {isSignedIn ? " Your row is marked so you can see how tracking looks." : null}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>
      ) : null}

      {loading || !isLoaded ? (
        <div className="card mt-10 p-10 text-center text-sm text-[var(--muted)]">
          Loading rankings…
        </div>
      ) : (
        <>
          {isSignedIn && yourEntry ? (
            <YourRankCard
              entry={yourEntry}
              eventTitle={eventTitle}
              total={entries.length}
            />
          ) : null}

          {isSignedIn && !yourEntry ? (
            <div className="card mt-10 border-dashed p-6 text-center">
              <p className="text-sm font-medium">You&apos;re not on this board yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                Finish your run, upload GPS proof, and after approval your rank shows here with
                a clear <strong>You</strong> marker.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link className="btn btn-primary h-9 px-4" href="/register">
                  Register
                </Link>
                <Link className="btn btn-secondary h-9 px-4" href="/dashboard">
                  Dashboard
                </Link>
              </div>
            </div>
          ) : null}

          {!isSignedIn ? (
            <div className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-center text-sm text-[var(--muted)]">
              <Link className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline" href="/sign-in">
                Sign in
              </Link>{" "}
              to track your own position on the leaderboard.
            </div>
          ) : null}

          <div className="table-wrap table-scroll mt-8 sm:mt-12">
            <table className="table-clean min-w-[640px] sm:min-w-[720px]">
              <thead>
                <tr>
                  {["Rank", "Runner", "Distance", "Time", "Bib", "Status"].map((head) => (
                    <th key={head}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => {
                  const isYou =
                    Boolean(currentClerkId) &&
                    Boolean(row.clerkId) &&
                    row.clerkId === currentClerkId;

                  return (
                    <tr
                      className={
                        isYou
                          ? "bg-[var(--panel-soft)] outline outline-1 outline-[var(--foreground)]"
                          : undefined
                      }
                      id={isYou ? "your-rank" : undefined}
                      key={`${row.rank}-${row.bibNumber}`}
                    >
                      <td className="font-mono text-xs tracking-wide">
                        {String(row.rank).padStart(2, "0")}
                      </td>
                      <td className="strong">
                        <span className="inline-flex flex-wrap items-center gap-2">
                          {row.runnerName}
                          {isYou ? (
                            <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                              You
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td>{row.distance}</td>
                      <td className="font-mono text-xs tracking-wide">
                        {formatTime(row.finishTimeSeconds)}
                      </td>
                      <td className="font-mono text-xs text-[var(--muted)]">{row.bibNumber}</td>
                      <td>
                        <span className="badge badge-sage">{row.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {entries.length <= 3 ? (
            <p className="mt-4 text-center text-sm text-[var(--muted)]">
              Only verified finishers so far — more ranks appear as proofs are verified.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
