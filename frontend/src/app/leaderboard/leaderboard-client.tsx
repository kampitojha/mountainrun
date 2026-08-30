"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  MapPin,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { cn } from "../../lib/cn";
import { allPublicEvents, publicEvents } from "../data/events";

export type LeaderboardEntry = {
  rank: number;
  runnerName: string;
  city?: string;
  state?: string;
  distance: string;
  finishTimeSeconds: number | null;
  bibNumber?: string;
  userId?: string;
  clerkId?: string | null;
  status: string;
  isPadded?: boolean;
};

type UserReg = {
  id: string;
  distance: string;
  bibNumber: string;
  proofStatus: string;
  status: string;
  finishTimeSeconds: number | null;
};

type EventOption = {
  id?: string;
  slug: string;
  name: string;
  distances?: string[];
};

function parseKm(distStr: string): number {
  if (!distStr) return 5;
  const lower = distStr.toLowerCase().trim();
  if (lower.includes("half") || lower.includes("21.1")) return 21.0975;
  if (lower.includes("full") || (lower.includes("marathon") && !lower.includes("half"))) return 42.195;
  const match = distStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!Number.isNaN(val) && val > 0) return val;
  }
  return 5;
}

function formatTime(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}h ${m}m ${String(s).padStart(2, "0")}s`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function formatPace(seconds: number | null | undefined, distanceStr: string): string {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) return "—";
  const km = parseKm(distanceStr);
  if (km <= 0) return "—";
  const paceSec = Math.round(seconds / km);
  const m = Math.floor(paceSec / 60);
  const s = Math.floor(paceSec % 60);
  return `${m}m ${String(s).padStart(2, "0")}s /km`;
}

function getInitials(name: string): string {
  if (!name) return "MR";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ── Top 3 Podium Card Component ─────────────────────────────────────────────
function PodiumCard({
  entry,
  position,
  activeDistance,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  activeDistance: string;
}) {
  const isFirst = position === 1;

  const medalMeta = {
    1: {
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      borderClass: "border-amber-500/50 shadow-amber-500/15",
      avatarClass: "from-amber-400 to-yellow-600 text-white ring-amber-400/50",
      crown: true,
      rankLabel: "Gold 🥇",
      rankText: "1st",
    },
    2: {
      badgeClass: "bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30",
      borderClass: "border-slate-300 dark:border-slate-700",
      avatarClass: "from-slate-400 to-slate-600 text-white ring-slate-400/30",
      crown: false,
      rankLabel: "Silver 🥈",
      rankText: "2nd",
    },
    3: {
      badgeClass: "bg-amber-800/15 text-amber-800 dark:text-amber-300 border-amber-800/30",
      borderClass: "border-amber-700/30",
      avatarClass: "from-amber-700 to-amber-900 text-white ring-amber-700/30",
      crown: false,
      rankLabel: "Bronze 🥉",
      rankText: "3rd",
    },
  }[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: isFirst ? -6 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: position * 0.08 }}
      className={cn(
        "relative flex flex-col items-center justify-between rounded-xl sm:rounded-2xl border bg-(--panel) p-2 sm:p-4 text-center transition-all duration-300 hover:shadow-xl w-full",
        medalMeta.borderClass,
        isFirst
          ? "-translate-y-1 sm:-translate-y-3 ring-1 ring-amber-500/30 bg-linear-to-b from-amber-500/8 via-(--panel) to-(--panel) shadow-lg"
          : "opacity-95 hover:opacity-100",
      )}
    >
      {/* Crown for #1 */}
      {medalMeta.crown && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-[0.55rem] sm:text-[0.65rem] font-black uppercase tracking-wider text-slate-950 shadow-md whitespace-nowrap z-10">
          <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Champion
        </div>
      )}

      {/* Header Badge */}
      <div className="mb-1 sm:mb-2 flex w-full items-center justify-between gap-1">
        <span
          className={cn(
            "rounded-full border px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-wider",
            medalMeta.badgeClass,
          )}
        >
          {medalMeta.rankLabel}
        </span>
        {entry.bibNumber && (
          <span className="hidden sm:inline font-mono text-[0.6rem] sm:text-[0.65rem] font-medium text-(--muted) truncate">
            {entry.bibNumber}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative my-1 sm:my-2">
        <div
          className={cn(
            "flex items-center justify-center rounded-xl sm:rounded-2xl bg-linear-to-tr font-bold tracking-tight shadow-md ring-2 sm:ring-4",
            isFirst
              ? "h-11 w-11 sm:h-16 sm:w-16 text-xs sm:text-lg"
              : "h-9 w-9 sm:h-14 sm:w-14 text-[0.7rem] sm:text-base",
            medalMeta.avatarClass,
          )}
        >
          {getInitials(entry.runnerName)}
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-(--panel) text-[0.55rem] sm:text-xs font-black shadow border border-(--line)">
          #{position}
        </span>
      </div>

      {/* Runner Info */}
      <div className="mt-0.5 sm:mt-1.5 w-full min-w-0 px-0.5">
        <h3 className="truncate text-[0.7rem] sm:text-sm font-bold tracking-tight text-foreground leading-tight">
          {entry.runnerName}
        </h3>
        {entry.city ? (
          <p className="flex items-center justify-center gap-0.5 text-[0.6rem] sm:text-xs text-(--muted) truncate mt-0.5">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-(--muted-soft) hidden sm:inline" />
            <span className="truncate">{entry.city}</span>
          </p>
        ) : (
          <p className="text-[0.6rem] sm:text-xs text-(--muted) truncate mt-0.5">India</p>
        )}
      </div>

      {/* Time & Pace stats */}
      <div className="mt-2 sm:mt-3 w-full rounded-lg sm:rounded-xl border border-(--line) bg-(--panel-soft) p-1.5 sm:p-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 sm:gap-2 text-center">
          <div>
            <p className="text-[0.5rem] sm:text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted)">Time</p>
            <p className="font-mono text-[0.65rem] sm:text-sm font-bold tracking-tight text-foreground truncate">
              {formatTime(entry.finishTimeSeconds)}
            </p>
          </div>
          <div className="hidden sm:block border-l border-(--line)">
            <p className="text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted)">Pace</p>
            <p className="font-mono text-[0.65rem] sm:text-sm font-bold tracking-tight text-(--sage) truncate">
              {formatPace(entry.finishTimeSeconds, activeDistance)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LeaderboardClient({
  initialSlug,
  initialDistance,
  hideHero = false,
}: {
  initialSlug?: string;
  initialDistance?: string;
  hideHero?: boolean;
} = {}) {
  const searchParams = useSearchParams();
  const initialEventParam = searchParams.get("event") || "";
  const initialDistanceParam = searchParams.get("distance") || "";

  const reduce = useReducedMotion();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const currentClerkId = user?.id ?? null;

  const [events, setEvents] = useState<EventOption[]>(
    allPublicEvents.map((e) => ({
      slug: e.slug,
      name: e.name,
      distances: e.distance
        ? e.distance.split("/").map((d) => d.trim()).filter(Boolean)
        : ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "21 km"],
    })),
  );

  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSlug || initialEventParam || allPublicEvents[0]?.slug || "sports-day-celebration",
  );
  const [selectedDistance, setSelectedDistance] = useState<string>(
    initialDistance || initialDistanceParam || "5 km",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<UserReg[]>([]);
  const [availableDistances, setAvailableDistances] = useState<string[]>([
    "1.5 km",
    "1.6 km",
    "3 km",
    "5 km",
    "10 km",
    "21 km",
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Match current public event details
  const matchedEvent = useMemo(() => {
    return allPublicEvents.find((e) => e.slug === selectedSlug) || publicEvents.find((e) => e.slug === selectedSlug);
  }, [selectedSlug]);

  const eventDateText = matchedEvent?.date || "29 Aug – 3 Sep 2026";
  const eventTitleText = matchedEvent?.name || "Sports Day Celebration";
  const eventPriceText = matchedEvent?.price || "Rs. 399";

  // Sync available distances when event changes
  const distanceOptions = useMemo(() => {
    if (availableDistances.length > 0) return availableDistances;
    const currentEv = events.find((e) => e.slug === selectedSlug);
    if (currentEv?.distances?.length) return currentEv.distances;
    return ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "21 km"];
  }, [availableDistances, events, selectedSlug]);

  // Load list of events from backend
  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/api/events"));
      if (!response.ok) return;
      const json = await response.json();
      const list = (json.data ?? []) as Array<{
        id: string;
        slug: string;
        title: string;
        distances: string[];
      }>;
      if (list.length > 0) {
        const mapped = list.map((e) => ({
          id: e.id,
          slug: e.slug,
          name: e.title,
          distances: e.distances?.length
            ? e.distances
            : ["1.5 km", "1.6 km", "3 km", "5 km", "10 km", "21 km"],
        }));
        setEvents(mapped);
        if (initialEventParam && mapped.some((e) => e.slug === initialEventParam)) {
          setSelectedSlug(initialEventParam);
        }
      }
    } catch {
      // Keep static fallback
    }
  }, [initialEventParam]);

  // Load leaderboard data for the selected event & distance
  const loadLeaderboard = useCallback(async () => {
    if (!selectedSlug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const distQuery = selectedDistance ? `?distance=${encodeURIComponent(selectedDistance)}` : "";
      const response = await fetch(
        getApiUrl(`/api/registrations/leaderboard/${encodeURIComponent(selectedSlug)}${distQuery}`),
      );

      if (!response.ok) {
        throw new Error("Could not load leaderboard data");
      }

      const json = await response.json();
      const rankedData = (json.data ?? []) as LeaderboardEntry[];
      const userRegs = (json.userRegistrations ?? []) as UserReg[];
      const distList = (json.meta?.availableDistances ?? []) as string[];

      setEntries(rankedData);
      setUserRegistrations(userRegs);
      if (distList.length > 0) {
        setAvailableDistances(distList);
      }
    } catch {
      setError("Unable to load live leaderboard. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [selectedDistance, selectedSlug]);

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

  // Filtered entries based on search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(
      (e) =>
        e.runnerName.toLowerCase().includes(q) ||
        (e.bibNumber && e.bibNumber.toLowerCase().includes(q)) ||
        (e.city && e.city.toLowerCase().includes(q)),
    );
  }, [entries, searchQuery]);

  // Top 3 Podium Runners
  const topThree = useMemo(() => {
    return {
      first: entries[0] || null,
      second: entries[1] || null,
      third: entries[2] || null,
    };
  }, [entries]);

  // User's own entry / standing on the board
  const userStanding = useMemo(() => {
    if (!isSignedIn) return null;
    const matchingRank = entries.find(
      (e) =>
        (currentClerkId && e.clerkId === currentClerkId) ||
        (user?.fullName && e.runnerName.toLowerCase() === user.fullName.toLowerCase()),
    );
    const userRegForEvent = userRegistrations.find(
      (r) => r.distance.toLowerCase().trim() === selectedDistance.toLowerCase().trim(),
    );
    const otherDistanceReg = userRegistrations.find(
      (r) => r.distance.toLowerCase().trim() !== selectedDistance.toLowerCase().trim(),
    );

    return {
      rankedEntry: matchingRank || null,
      currentDistanceReg: userRegForEvent || null,
      otherDistanceReg: otherDistanceReg || null,
    };
  }, [currentClerkId, entries, isSignedIn, selectedDistance, user, userRegistrations]);


  return (
    <div className="min-w-0 pb-16 px-1 sm:px-0">
      {/* ── HERO ──────────────────────────────────────────────── */}
      {!hideHero && (
        <section className="relative overflow-hidden border-b border-(--line)">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: [
                "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 14%, transparent) 0%, transparent 60%)",
                "radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in srgb, #eab308 10%, transparent) 0%, transparent 50%)",
                "var(--background)",
              ].join(", "),
            }}
          />

          <div className="container-page py-8 sm:py-12 md:py-14">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-(--sage)/30 bg-(--sage-soft) px-2.5 py-0.5 sm:px-3 sm:py-1 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider text-(--sage)">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Official Event Leaderboard
              </div>
              <h1 className="mt-2.5 sm:mt-3 text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                Verified Race Rankings
              </h1>
              <p className="lede mx-auto mt-2.5 sm:mt-3 max-w-lg text-xs sm:text-base">
                Explore real-time standings across all distance categories. Every finish is verified with GPS tracking.
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CONTROLS & FILTERS ─────────────────────────────────── */}
      <section className={cn("section", hideHero ? "pt-2 sm:pt-4" : "pt-5 sm:pt-8")}>
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Event Selector & Search Bar */}
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-12">
              {/* Event Select */}
              <div className={entries.length > 0 ? "lg:col-span-6" : "lg:col-span-12"}>
                <label className="block text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider text-(--muted) mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-(--sage)" /> Select Event
                  </span>
                </label>
                <select
                  className="input w-full font-medium text-xs sm:text-sm"
                  value={selectedSlug}
                  onChange={(e) => {
                    setSelectedSlug(e.target.value);
                    setSearchQuery("");
                  }}
                >
                  {events.map((ev) => (
                    <option key={ev.slug} value={ev.slug}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instant Search Bar (Only shown when results exist) */}
              {entries.length > 0 && (
                <div className="lg:col-span-6">
                  <label className="block text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider text-(--muted) mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5 text-(--sage)" /> Search Runner or Bib #
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--muted-soft)"
                    />
                    <input
                      type="text"
                      placeholder="Search runner name, city, or bib (e.g. MR-5K-101)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: "2.65rem", paddingRight: "2.25rem" }}
                      className="input w-full text-xs sm:text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-(--muted) hover:bg-(--panel-soft) hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── DISTANCE CATEGORY PILLS (Swipeable on Mobile) ── */}
            <div>
              <p className="mb-2 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider text-(--muted)">
                Choose Distance Category:
              </p>
              <div
                className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {distanceOptions.map((dist) => {
                  const isSelected = selectedDistance.toLowerCase().trim() === dist.toLowerCase().trim();
                  return (
                    <button
                      key={dist}
                      onClick={() => {
                        setSelectedDistance(dist);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "group relative flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:px-4 sm:py-2.5 sm:text-sm cursor-pointer select-none",
                        isSelected
                          ? "bg-(--sage) text-(--on-accent) shadow-md shadow-(--sage)/20"
                          : "border border-(--line) bg-(--panel) text-(--muted) hover:border-(--sage)/40 hover:text-foreground",
                      )}
                    >
                      <Ruler className={cn("h-3.5 w-3.5", isSelected ? "text-white" : "text-(--muted-soft) group-hover:text-(--sage)")} />
                      {dist}
                      {isSelected && (
                        <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[0.6rem] font-mono">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── USER RECOGNITION / PERSONAL STANDING BANNER ──────── */}
          {isLoaded && isSignedIn && !loading && (
            <div className="mt-4 sm:mt-6">
              {userStanding?.rankedEntry ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow text-sm sm:text-base">
                      #{userStanding.rankedEntry.rank}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        You are ranked <span className="text-amber-500">#{userStanding.rankedEntry.rank}</span> in {selectedDistance}!
                      </p>
                      <p className="text-[0.7rem] sm:text-xs text-(--muted)">
                        Time: <span className="font-mono font-bold text-foreground">{formatTime(userStanding.rankedEntry.finishTimeSeconds)}</span>
                        {" · "}
                        Pace: <span className="font-mono font-bold text-(--sage)">{formatPace(userStanding.rankedEntry.finishTimeSeconds, selectedDistance)}</span>
                        {userStanding.rankedEntry.bibNumber && ` · Bib: ${userStanding.rankedEntry.bibNumber}`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="btn btn-secondary text-xs w-full sm:w-fit py-1.5 px-3 text-center"
                  >
                    View in Dashboard
                  </Link>
                </motion.div>
              ) : userStanding?.currentDistanceReg ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 rounded-2xl border border-(--line) bg-(--panel-soft) p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      You are registered for <span className="text-(--sage)">{userStanding.currentDistanceReg.distance}</span> (Bib: {userStanding.currentDistanceReg.bibNumber})
                    </p>
                    <p className="text-[0.7rem] sm:text-xs text-(--muted) mt-0.5">
                      {userStanding.currentDistanceReg.proofStatus === "SUBMITTED"
                        ? "Your run proof has been submitted and is currently under review. Your rank will appear here once approved."
                        : "You haven't submitted your run proof yet. Complete your run and upload your GPS screenshot to claim your rank & certificate."}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="btn btn-secondary text-xs w-full sm:w-fit py-1.5 px-3 text-center shrink-0"
                  >
                    {userStanding.currentDistanceReg.proofStatus === "SUBMITTED" ? "View Dashboard" : "Upload Run Proof →"}
                  </Link>
                </motion.div>
              ) : userStanding?.otherDistanceReg ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 rounded-2xl border border-(--line) bg-(--panel-soft) p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                >
                  <p className="text-xs sm:text-sm text-(--muted)">
                    You are registered for <span className="font-bold text-foreground">{userStanding.otherDistanceReg.distance}</span> in this event.
                  </p>
                  <button
                    onClick={() => setSelectedDistance(userStanding.otherDistanceReg!.distance)}
                    className="text-xs font-bold text-(--sage) underline-offset-2 hover:underline w-fit cursor-pointer"
                  >
                    Switch to {userStanding.otherDistanceReg.distance} Leaderboard →
                  </button>
                </motion.div>
              ) : null}
            </div>
          )}

          {/* ── LOADING STATE ────────────────────────────────────── */}
          {loading ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-(--panel) py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-(--line) border-t-(--sage)" />
              <p className="mt-4 text-xs sm:text-sm font-medium text-(--muted)">Loading {selectedDistance} rankings...</p>
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-xs sm:text-sm text-red-700">
              {error}
            </div>
          ) : entries.length === 0 ? (
            /* ── CLEAN DYNAMIC EVENT DURATION RESULTS NOTICE ── */
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-(--panel) p-8 text-center sm:p-12 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--sage-soft) text-(--sage)">
                <Clock className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-foreground sm:text-xl">
                Results will start coming {eventDateText}
              </h3>

              <p className="mt-2 max-w-md text-xs text-(--muted) sm:text-sm leading-relaxed">
                Official finish timings and verified rankings will be updated live here as runners complete their run and submit GPS proofs.
              </p>

              <div className="mt-6">
                <Link
                  href={`/events/${selectedSlug}`}
                  className="btn btn-primary text-xs sm:text-sm px-6 py-2.5 font-semibold"
                >
                  Register for {eventTitleText} ({eventPriceText}) →
                </Link>
              </div>
            </div>
          ) : (
            /* ── VERIFIED LEADERBOARD TABLE ── */
            <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
              {/* TOP 3 PODIUM */}
              {!searchQuery && entries.length >= 3 && (
                <div>
                  <div className="mb-3.5 text-center">
                    <p className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider text-amber-500">
                      Podium Finishers
                    </p>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                      Top 3 in {selectedDistance}
                    </h2>
                  </div>

                  {/* Responsive 3-Column Parallel Podium Grid */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-5 items-end max-w-4xl mx-auto pt-3 sm:pt-6">
                    {topThree.second && (
                      <div className="order-1">
                        <PodiumCard
                          entry={topThree.second}
                          position={2}
                          activeDistance={selectedDistance}
                        />
                      </div>
                    )}

                    {topThree.first && (
                      <div className="order-2">
                        <PodiumCard
                          entry={topThree.first}
                          position={1}
                          activeDistance={selectedDistance}
                        />
                      </div>
                    )}

                    {topThree.third && (
                      <div className="order-3">
                        <PodiumCard
                          entry={topThree.third}
                          position={3}
                          activeDistance={selectedDistance}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FULL RANKINGS CONTAINER */}
              <div className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel) shadow-xs">
                <div className="border-b border-(--line) bg-(--panel-soft) px-3.5 py-3 sm:px-6 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    All Verified Finishers · {selectedDistance}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[0.7rem] sm:text-xs text-(--muted)">
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-(--sage)" /> GPS Verified
                  </div>
                </div>

                {/* ── MOBILE VIEW: High-Performance Compact List (< sm) ── */}
                <div className="block sm:hidden divide-y divide-(--line)">
                  {filteredEntries.map((row) => {
                    const isYou =
                      Boolean(currentClerkId && row.clerkId === currentClerkId) ||
                      Boolean(user?.fullName && row.runnerName.toLowerCase() === user.fullName.toLowerCase());
                    const isTop3 = row.rank <= 3;

                    return (
                      <div
                        key={`${row.rank}-${row.bibNumber || row.runnerName}`}
                        className={cn(
                          "flex items-center justify-between p-3 transition-colors hover:bg-(--panel-soft)/70",
                          isYou && "bg-(--sage-soft) ring-1 ring-(--sage)/40",
                        )}
                      >
                        {/* Left: Rank + Avatar + Name & Details */}
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {/* Rank */}
                          <div className="flex w-6 shrink-0 items-center justify-center font-mono text-xs font-bold">
                            {row.rank === 1 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-xs">
                                🥇
                              </span>
                            ) : row.rank === 2 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-400/20 text-xs">
                                🥈
                              </span>
                            ) : row.rank === 3 ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-800/20 text-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="text-(--muted) font-semibold text-[0.75rem]">#{row.rank}</span>
                            )}
                          </div>

                          {/* Avatar */}
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-(--line) bg-(--panel-soft) text-[0.65rem] font-bold text-foreground">
                            {getInitials(row.runnerName)}
                          </div>

                          {/* Name + Subtitle */}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-xs truncate flex items-center gap-1.5">
                              <span className="truncate">{row.runnerName}</span>
                              {isYou && (
                                <span className="shrink-0 rounded-full bg-(--sage) px-1.5 py-0.2 text-[0.55rem] font-bold uppercase tracking-wider text-white">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="font-mono text-[0.65rem] text-(--muted) truncate">
                              {row.bibNumber || `MR-${parseKm(selectedDistance)}K-${100 + row.rank}`}
                              {row.city ? ` · ${row.city}` : " · India"}
                            </p>
                          </div>
                        </div>

                        {/* Right: Time & Pace */}
                        <div className="text-right shrink-0">
                          <p className="font-mono text-xs font-bold text-foreground">
                            {formatTime(row.finishTimeSeconds)}
                          </p>
                          <p className="font-mono text-[0.65rem] font-medium text-(--sage)">
                            {formatPace(row.finishTimeSeconds, selectedDistance)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── DESKTOP VIEW: Full Wide Table (>= sm) ── */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-152 text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-(--line) bg-(--panel-soft)/50 text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                        <th className="px-4 py-3.5">Rank</th>
                        <th className="px-4 py-3.5">Runner</th>
                        <th className="px-4 py-3.5">Bib #</th>
                        <th className="px-4 py-3.5">City</th>
                        <th className="px-4 py-3.5">Distance</th>
                        <th className="px-4 py-3.5">Pace</th>
                        <th className="px-4 py-3.5">Finish Time</th>
                        <th className="px-4 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((row) => {
                        const isYou =
                          Boolean(currentClerkId && row.clerkId === currentClerkId) ||
                          Boolean(user?.fullName && row.runnerName.toLowerCase() === user.fullName.toLowerCase());
                        const isTop3 = row.rank <= 3;

                        return (
                          <tr
                            key={`${row.rank}-${row.bibNumber || row.runnerName}`}
                            className={cn(
                              "border-b border-(--line) last:border-b-0 transition-colors hover:bg-(--panel-soft)/70",
                              isYou && "bg-(--sage-soft) ring-1 ring-(--sage)/40",
                              isTop3 && "font-medium",
                            )}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                                {row.rank === 1 ? (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                    🥇
                                  </span>
                                ) : row.rank === 2 ? (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-400/20 text-slate-600 dark:text-slate-300">
                                    🥈
                                  </span>
                                ) : row.rank === 3 ? (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-800/20 text-amber-800 dark:text-amber-300">
                                    🥉
                                  </span>
                                ) : (
                                  <span className="w-6 text-center text-(--muted)">
                                    #{row.rank}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-(--line) bg-(--panel-soft) text-[0.65rem] font-bold text-foreground">
                                  {getInitials(row.runnerName)}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                                    {row.runnerName}
                                    {isYou && (
                                      <span className="rounded-full bg-(--sage) px-1.5 py-0.2 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                                        You
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 font-mono text-xs text-(--muted)">
                              {row.bibNumber || `MR-${parseKm(selectedDistance)}K-${100 + row.rank}`}
                            </td>

                            <td className="px-4 py-3.5 text-xs text-(--muted)">
                              {row.city || "India"}
                            </td>

                            <td className="px-4 py-3.5 font-medium text-foreground text-xs">
                              {row.distance || selectedDistance}
                            </td>

                            <td className="px-4 py-3.5 font-mono text-xs font-semibold text-(--sage)">
                              {formatPace(row.finishTimeSeconds, selectedDistance)}
                            </td>

                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-foreground">
                              {formatTime(row.finishTimeSeconds)}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredEntries.length === 0 && searchQuery && (
                  <div className="py-10 text-center text-xs sm:text-sm text-(--muted)">
                    No runners match &ldquo;{searchQuery}&rdquo;. Try another name or bib number.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
