"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, Ruler, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { publicEvents } from "../data/events";
import { cn } from "../../lib/cn";

export type LeaderboardEntry = {
  rank: number;
  runnerName: string;
  distance: string;
  finishTimeSeconds: number | null;
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
  { rank: 1, runnerName: "Aarav Sharma", distance: "21 km", finishTimeSeconds: 6138, status: "Verified" },
  { rank: 2, runnerName: "Nisha Rawat", distance: "10 km", finishTimeSeconds: 2942, status: "Verified" },
  { rank: 3, runnerName: "Kabir Sethi", distance: "10 km", finishTimeSeconds: 3104, status: "Verified" },
  { rank: 4, runnerName: "Meera Joshi", distance: "5 km", finishTimeSeconds: 1459, status: "Verified" },
  { rank: 5, runnerName: "Rohan Kapoor", distance: "21 km", finishTimeSeconds: 6535, status: "Verified" },
  { rank: 6, runnerName: "Ananya Iyer", distance: "5 km", finishTimeSeconds: 1571, status: "Verified" },
  { rank: 7, runnerName: "Dev Malhotra", distance: "10 km", finishTimeSeconds: 3288, status: "Verified" },
  { rank: 8, runnerName: "Isha Verma", distance: "21 km", finishTimeSeconds: 7020, status: "Verified" },
];

function formatTime(seconds: number | null | undefined) {
  if (seconds == null || Number.isNaN(seconds)) return "\u2014";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${String(h).padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
}

function rankEmoji(rank: number) {
  if (rank === 1) return "\uD83E\uDD47";
  if (rank === 2) return "\uD83E\uDD48";
  if (rank === 3) return "\uD83E\uDD49";
  return null;
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return (
    <div className="group flex flex-col items-center gap-1.5 rounded-2xl border border-(--line) bg-(--panel) px-3 py-3 text-center transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-4 sm:text-left">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage) transition-all group-hover:border-(--sage)/30 group-hover:bg-(--sage)/10 sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-base font-bold tracking-tight tabular-nums text-(--foreground) sm:text-xl">{value}</p>
        <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted) sm:text-xs">{label}</p>
      </div>
    </div>
  );
}

function YourRankCard({ entry, total }: { entry: LeaderboardEntry; total: number }) {
  const medal = rankEmoji(entry.rank);
  return (
    <motion.div
      className="rounded-2xl border border-(--sage)/30 bg-(--sage-soft) px-4 py-4 sm:px-5 sm:py-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-(--sage) px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-(--on-accent)">
          {medal ? <span className="text-base leading-none">{medal}</span> : null}
          You
        </span>
        <p className="text-sm font-semibold tracking-tight text-(--foreground)">
          Rank <span className="tabular-nums">#{entry.rank}</span>
          <span className="font-medium text-(--muted)"> / {total}</span>
        </p>
        <p className="text-sm text-(--muted)">
          <span className="font-medium text-(--foreground)">{entry.distance}</span>
          <span className="mx-1.5 text-(--muted-soft)">&middot;</span>
          <span className="font-mono text-xs tracking-wide text-(--foreground)">{formatTime(entry.finishTimeSeconds)}</span>
        </p>
        <a
          className="text-xs font-medium text-(--sage) underline-offset-2 hover:underline sm:ml-auto"
          href="#your-rank"
        >
          Jump to row
        </a>
      </div>
    </motion.div>
  );
}

function MedalBadge({ rank }: { rank: number }) {
  const emoji = rankEmoji(rank);
  if (!emoji) return null;
  return <span className="hidden sm:inline text-base leading-none">{emoji}</span>;
}

export function LeaderboardClient() {
  const reduce = useReducedMotion();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const currentClerkId = user?.id ?? null;

  const [events, setEvents] = useState<EventOption[]>(
    publicEvents.map((e) => ({ slug: e.slug, name: e.name })),
  );
  const [selectedSlug, setSelectedSlug] = useState(publicEvents[0]?.slug ?? "");
  const [distance, setDistance] = useState<string>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distanceOptions = useMemo(() => {
    const fromApi = events.find((e) => e.slug === selectedSlug)?.distances;
    if (fromApi?.length) return fromApi;
    const pub = publicEvents.find((e) => e.slug === selectedSlug);
    if (pub?.distance) return pub.distance.split("/").map((d) => d.trim()).filter(Boolean);
    return ["5 km", "10 km", "21 km"];
  }, [events, selectedSlug]);

  const stats = useMemo(() => {
    const uniqueRunners = new Set(entries.map((e) => e.runnerName)).size;
    const verified = entries.filter((e) => e.status === "Verified").length;
    const distances = new Set(entries.map((e) => e.distance)).size;
    return { total: entries.length, runners: uniqueRunners, verified, distances };
  }, [entries]);

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/api/events"));
      if (!response.ok) return;
      const json = await response.json();
      const list = (json.data ?? []) as Array<{ id: string; slug: string; title: string; distances: string[] }>;
      if (list.length > 0) {
        setEvents(list.map((e) => ({ id: e.id, slug: e.slug, name: e.title, distances: e.distances })));
        setSelectedSlug((prev) => prev || list[0].slug);
      }
    } catch {
      // keep fallback
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    if (!selectedSlug) return;
    setLoading(true);
    setError(null);

    try {
      const query = distance !== "all" ? `?distance=${encodeURIComponent(distance)}` : "";
      const response = await fetch(getApiUrl(`/api/registrations/leaderboard/${selectedSlug}${query}`));
      if (!response.ok) throw new Error("Could not load leaderboard");
      const json = await response.json();
      const rows = (json.data ?? []) as LeaderboardEntry[];
      if (rows.length === 0) {
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
              clerkId: currentClerkId,
              status: "Verified",
            },
            ...demo.slice(4),
          ].map((row, i) => ({ ...row, rank: i + 1 })).slice(0, 8);
        }
        setEntries(demo);
        setUsingDemo(true);
      } else {
        setEntries(rows);
        setUsingDemo(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setEntries(DEMO_ENTRIES);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, [currentClerkId, distance, isSignedIn, selectedSlug, user]);

  useEffect(() => { const t = window.setTimeout(() => { void loadEvents(); }, 0); return () => window.clearTimeout(t); }, [loadEvents]);
  useEffect(() => { const t = window.setTimeout(() => { void loadLeaderboard(); }, 0); return () => window.clearTimeout(t); }, [loadLeaderboard]);

  const yourEntry = useMemo(() => {
    if (!currentClerkId) return null;
    return entries.find((e) => e.clerkId === currentClerkId) ?? null;
  }, [currentClerkId, entries]);

  return (
    <div className="min-w-0">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div aria-hidden className="pointer-events-none absolute top-8 right-8 flex gap-1.5 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-(--sage) animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="container-page py-10 sm:py-12 md:py-14">
          <motion.div
            className="mx-auto max-w-xl text-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">Leaderboard</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl">
              Verified rankings
            </h1>
            <p className="lede mx-auto mt-4 max-w-lg">
              GPS-verified finishes only. Every second is honest. Log in to see where you stand.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-3 sm:mt-10 sm:gap-4"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <StatCard icon={Users} label="Entries" value={stats.total} />
            <StatCard icon={Trophy} label="Verified" value={stats.verified} />
            <StatCard icon={Ruler} label="Distances" value={stats.distances} />
          </motion.div>
        </div>
      </section>

      {/* ── FILTERS ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <motion.div
            className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel) p-4 sm:p-5"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
              <label className="block min-w-0 flex-1 text-sm">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-(--muted)">
                  <Calendar className="h-3.5 w-3.5 text-(--muted-soft)" strokeWidth={1.75} />
                  Event
                </span>
                <select
                  className="input"
                  onChange={(e) => { setSelectedSlug(e.target.value); setDistance("all"); }}
                  value={selectedSlug}
                >
                  {events.map((event) => (
                    <option key={event.slug} value={event.slug}>{event.name}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0 sm:w-44 text-sm">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-(--muted)">
                  <Ruler className="h-3.5 w-3.5 text-(--muted-soft)" strokeWidth={1.75} />
                  Distance
                </span>
                <select className="input" onChange={(e) => setDistance(e.target.value)} value={distance}>
                  <option value="all">All</option>
                  {distanceOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
          </motion.div>

          {/* ── INFO BANNERS ──────────────────────────────────── */}
          <AnimatePresence>
            {usingDemo ? (
              <motion.p
                className="mt-4 rounded-xl border border-(--line) bg-(--panel-soft) px-4 py-3 text-sm text-(--muted)"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                Showing sample rankings until approved proofs appear for this event.
                {isSignedIn ? " Your row is marked so you can see how tracking looks." : null}
              </motion.p>
            ) : null}

            {error ? (
              <motion.p
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            ) : null}
          </AnimatePresence>

          {/* ── YOUR RANK ─────────────────────────────────────── */}
          {isLoaded && !loading ? (
            <AnimatePresence>
              {isSignedIn && yourEntry ? (
                <div className="mt-6 sm:mt-8">
                  <YourRankCard entry={yourEntry} total={entries.length} />
                </div>
              ) : null}

              {isSignedIn && !yourEntry ? (
                <motion.div
                  className="mt-6 rounded-2xl border border-dashed border-(--line) px-4 py-4 sm:mt-8 sm:px-5 sm:py-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-(--muted)">
                    You&apos;re not on this board yet.{" "}
                    <Link className="font-medium text-(--foreground) underline-offset-2 hover:underline" href="/events">Register</Link>
                    <span className="mx-1.5 text-(--muted-soft)">·</span>
                    <Link className="font-medium text-(--foreground) underline-offset-2 hover:underline" href="/dashboard">Dashboard</Link>
                  </p>
                </motion.div>
              ) : null}

              {!isSignedIn ? (
                <motion.div
                  className="mt-6 rounded-2xl border border-(--line) bg-(--panel-soft) px-4 py-4 text-sm text-(--muted) sm:mt-8 sm:px-5 sm:py-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Link className="font-medium text-(--foreground) underline-offset-2 hover:underline" href="/sign-in">Sign in</Link>{" "}
                  to see your rank on this board.
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}

          {/* ── LOADING ────────────────────────────────────────── */}
          {loading || !isLoaded ? (
            <div className="mt-10 flex items-center justify-center rounded-2xl border border-(--line) bg-(--panel) px-4 py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--line-strong) border-t-(--sage)" />
                <p className="text-sm text-(--muted)">Loading rankings\u2026</p>
              </div>
            </div>
          ) : (
            <>
              {/* ── TABLE ──────────────────────────────────────── */}
              <div className="relative mt-8 overflow-hidden rounded-2xl border border-(--line) bg-(--panel) sm:mt-10">
                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-(--line) bg-(--panel-soft)/70">
                        {["Rank", "Runner", "Distance", "Time", "Status"].map((head) => (
                          <th key={head} className="px-3 py-3 text-[0.65rem] font-semibold uppercase tracking-widest text-(--muted) sm:px-4 sm:py-3.5">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((row, idx) => {
                        const isYou = Boolean(currentClerkId) && Boolean(row.clerkId) && row.clerkId === currentClerkId;
                        return (
                          <motion.tr
                            id={isYou ? "your-rank" : undefined}
                            key={`${row.rank}-${row.runnerName}`}
                            className={cn(
                              "border-b border-(--line) last:border-b-0 transition-colors",
                              "hover:bg-(--panel-soft)/50",
                              isYou && "bg-(--sage-soft) outline outline-1 outline-(--sage)/40",
                            )}
                            initial={reduce ? false : { opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4), ease: [0.22, 1, 0.36, 1] }}
                          >
                            <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                              <span className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wide text-(--foreground)">
                                <MedalBadge rank={row.rank} />
                                {String(row.rank).padStart(2, "0")}
                              </span>
                            </td>
                            <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                              <span className="inline-flex flex-wrap items-center gap-1.5 font-medium text-(--foreground)">
                                {row.runnerName}
                                {isYou ? (
                                  <span className="rounded-full bg-(--sage) px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-(--on-accent)">
                                    You
                                  </span>
                                ) : null}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-(--muted) sm:px-4 sm:py-3.5">{row.distance}</td>
                            <td className="px-3 py-3 font-mono text-xs tracking-wide text-(--foreground) sm:px-4 sm:py-3.5">{formatTime(row.finishTimeSeconds)}</td>
                            <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                              <span className="badge badge-sage">{row.status}</span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── FOOTNOTE ──────────────────────────────────── */}
              <AnimatePresence>
                {entries.length <= 3 ? (
                  <motion.p
                    className="mt-4 text-center text-sm text-(--muted)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Only verified finishers so far — more ranks appear as proofs are verified.
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
