"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Gift,
  HelpCircle,
  IndianRupee,
  MapPin,
  Medal,
  Plus,
  RefreshCw,
  Route,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Truck,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";
import { cn } from "../../lib/cn";
import { parseTimeToSeconds, validateProofForm } from "../../lib/validation";

type Registration = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  finishTimeSeconds?: number | null;
  registeredAt: string;
  event: { title: string; slug: string; benefits?: string[] };
  payment: { status: string; amountInPaise: number } | null;
  proofUpload?: {
    activityImageUrl: string;
    sourceApp: string;
    status: string;
    reviewerNote?: string | null;
  } | null;
  certificate?: {
    certificateNumber: string;
    status: string;
    pdfUrl?: string | null;
  } | null;
  medalDelivery?: {
    status: string;
    trackingNumber: string | null;
    trackingUrl?: string | null;
    courier?: string | null;
  } | null;
};

type DbUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  clerkId: string | null;
  role?: string;
  referralCode?: string | null;
  registrations: Registration[];
};

const SOURCE_APPS = [
  "Strava",
  "Garmin Connect",
  "Nike Run Club",
  "Adidas Running",
  "Apple Fitness",
  "Google Fit",
  "MapMyRun",
  "Other",
];

function formatMoney(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function parseKm(distStr: string): number {
  if (!distStr) return 5;
  const lower = distStr.toLowerCase().trim();
  if (lower.includes("half") || lower.includes("21.1")) return 21.1;
  if (lower.includes("full") || (lower.includes("marathon") && !lower.includes("half"))) return 42.2;
  const match = distStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!Number.isNaN(val) && val > 0) return val;
  }
  return 5;
}

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${String(s).padStart(2, "0")}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function isEligible(reg: Registration) {
  return (
    reg.status === "CONFIRMED" ||
    reg.status === "COMPLETED" ||
    reg.payment?.status === "PAID"
  );
}

function canUpload(reg: Registration) {
  return (
    isEligible(reg) &&
    (reg.proofStatus === "NOT_SUBMITTED" || reg.proofStatus === "REJECTED")
  );
}

function dedupe(rows: Registration[]) {
  const s = new Set<string>();
  return rows.filter((r) => {
    if (s.has(r.id)) return false;
    s.add(r.id);
    return true;
  });
}

async function fileToPayload(file: File): Promise<string> {
  const isImageMime = file.type ? file.type.startsWith("image/") : false;
  const isImageExt = /\.(jpe?g|png|webp|heic|bmp|gif)$/i.test(file.name);
  if (!isImageMime && !isImageExt) {
    throw new Error("Please choose an image file (JPEG, PNG, WebP).");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Image file is too large (maximum 15 MB). Please choose a smaller image.");
  }

  try {
    if (typeof window !== "undefined" && typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(bmp.width * scale));
      c.height = Math.max(1, Math.round(bmp.height * scale));
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(bmp, 0, 0, c.width, c.height);
        bmp.close();
        return c.toDataURL("image/jpeg", 0.85);
      }
      bmp.close();
    }
  } catch (err) {
    console.warn("Canvas compression failed, falling back to FileReader:", err);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read image file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function DashboardClient() {
  const reduce = useReducedMotion();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "trophies" | "refer">("active");

  // Proof upload modal/drawer state
  const [proofRegId, setProofRegId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [sourceApp, setSourceApp] = useState("Strava");
  const [finishHours, setFinishHours] = useState("");
  const [finishMinutes, setFinishMinutes] = useState("");
  const [finishSeconds, setFinishSeconds] = useState("");
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const seq = useRef(0);

  const hoursInputRef = useRef<HTMLInputElement | null>(null);
  const minutesInputRef = useRef<HTMLInputElement | null>(null);
  const secondsInputRef = useRef<HTMLInputElement | null>(null);

  function handleTimePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const parsedSecs = parseTimeToSeconds(text);
    if (parsedSecs && parsedSecs > 0) {
      e.preventDefault();
      const h = Math.floor(parsedSecs / 3600);
      const m = Math.floor((parsedSecs % 3600) / 60);
      const s = parsedSecs % 60;
      setFinishHours(h > 0 ? String(h).padStart(2, "0") : "");
      setFinishMinutes(String(m).padStart(2, "0"));
      setFinishSeconds(String(s).padStart(2, "0"));
    }
  }

  const formattedTimePreview = useMemo(() => {
    const h = parseInt(finishHours, 10) || 0;
    const m = parseInt(finishMinutes, 10) || 0;
    const s = parseInt(finishSeconds, 10) || 0;
    if (!finishHours && !finishMinutes && !finishSeconds) return null;
    if (h === 0 && m === 0 && s === 0) return null;

    const parts: string[] = [];
    if (h > 0) parts.push(`${h} hr${h > 1 ? "s" : ""}`);
    if (m > 0 || h > 0) parts.push(`${m} min${m !== 1 ? "s" : ""}`);
    if (s > 0 || (!h && !m)) parts.push(`${s} sec${s !== 1 ? "s" : ""}`);

    const digital = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return { label: parts.join(" "), digital };
  }, [finishHours, finishMinutes, finishSeconds]);

  const load = useCallback(async () => {
    const id = ++seq.current;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Could not get session token.");
      await fetch(getApiUrl("/api/users/sync"), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          clerkId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          name: user?.fullName ?? user?.firstName,
          phone: user?.primaryPhoneNumber?.phoneNumber,
          avatarUrl: user?.imageUrl,
        }),
      });
      const res = await fetch(getApiUrl("/api/users/me"), {
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Could not load dashboard"));
      const json = await res.json();
      if (seq.current === id) setDbUser(json.data as DbUser);
    } catch (err) {
      if (seq.current === id) setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (seq.current === id) setLoading(false);
    }
  }, [getToken, isSignedIn, user]);

  const loadMe = useCallback(async () => {
    const id = ++seq.current;
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(getApiUrl("/api/users/me"), { headers: authHeaders(token) });
      if (!res.ok) return;
      const json = await res.json();
      if (seq.current === id) setDbUser(json.data as DbUser);
    } catch {
      // keep last known state
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      const t = setTimeout(() => void load(), 0);
      return () => clearTimeout(t);
    }
  }, [isLoaded, load]);

  const registrations = useMemo(() => dedupe(dbUser?.registrations ?? []), [dbUser]);
  const isAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "SUPER_ADMIN";

  // Categorize registrations for clean tabs
  const activeRegistrations = useMemo(() => {
    return registrations.filter((r) => r.status !== "CANCELLED");
  }, [registrations]);

  const trophyRegistrations = useMemo(() => {
    return registrations.filter(
      (r) =>
        r.proofStatus === "APPROVED" ||
        Boolean(r.certificate) ||
        Boolean(r.medalDelivery),
    );
  }, [registrations]);

  const totalKmRun = useMemo(() => {
    return activeRegistrations.reduce((acc, r) => acc + parseKm(r.distance), 0);
  }, [activeRegistrations]);

  const verifiedFinishesCount = useMemo(() => {
    return registrations.filter((r) => r.proofStatus === "APPROVED").length;
  }, [registrations]);

  const hasPending = useMemo(
    () =>
      registrations.some(
        (r) => r.payment?.status === "CREATED" || r.proofStatus === "SUBMITTED",
      ),
    [registrations],
  );

  useEffect(() => {
    if (!hasPending || !isLoaded) return;
    const interval = setInterval(() => {
      void loadMe();
    }, 30_000);
    return () => clearInterval(interval);
  }, [hasPending, isLoaded, loadMe]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function onPickFile(file: File | null) {
    setProofError(null);
    setProofFileName(null);
    setProofUrl("");
    if (!file) return;
    try {
      setProofBusy(true);
      setProofUrl(await fileToPayload(file));
      setProofFileName(file.name);
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Could not read image");
    } finally {
      setProofBusy(false);
    }
  }

  async function submitProof(e: FormEvent) {
    e.preventDefault();
    if (!proofRegId) return;
    setProofBusy(true);
    setProofMessage(null);
    setProofError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in again to submit proof.");
      let url = proofUrl.trim();

      const errors = validateProofForm({
        proofUrl: url,
        sourceApp,
        finishHours,
        finishMinutes,
        finishSeconds,
      });

      const firstError = Object.values(errors).find(Boolean);
      if (firstError) {
        throw new Error(firstError);
      }

      if (url.startsWith("data:") || url.startsWith("https://") || url.startsWith("http://")) {
        if (url.startsWith("data:")) {
          const up = await fetch(getApiUrl("/api/uploads/image"), {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({ file: url, folder: "mountainrun/proofs" }),
          });
          if (!up.ok) {
            if (!url.startsWith("https://")) {
              throw new Error(await readApiError(up, "Image upload failed. Please try again."));
            }
          } else {
            const upJson = await up.json();
            url = upJson.data?.url || url;
          }
        }
      }

      const h = Math.max(0, parseInt(finishHours, 10) || 0);
      const m = Math.max(0, parseInt(finishMinutes, 10) || 0);
      const s = Math.max(0, parseInt(finishSeconds, 10) || 0);
      const totalSecs = h * 3600 + m * 60 + s;

      if (totalSecs > 0 && totalSecs < 60) {
        throw new Error("Finish time cannot be under 1 minute. Please check your entered time or leave it empty.");
      }

      const secs = totalSecs > 0 ? totalSecs : undefined;

      const res = await fetch(getApiUrl(`/api/registrations/${proofRegId}/proof`), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          activityImageUrl: url,
          sourceApp: sourceApp.trim() || "Strava",
          finishTimeSeconds: secs,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Proof submission failed. Please try again."));
      }

      setProofMessage("Proof submitted successfully! You'll receive your e-certificate after verification.");
      setProofRegId(null);
      setProofUrl("");
      setProofFileName(null);
      setFinishHours("");
      setFinishMinutes("");
      setFinishSeconds("");
      await load();
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Proof submit failed");
    } finally {
      setProofBusy(false);
    }
  }

  function handleCopyReferral() {
    const code = dbUser?.referralCode || user?.id?.slice(-6) || "MOUNTAINRUN";
    const link = `https://mountainrun.in/register?ref=${code}`;
    void navigator.clipboard.writeText(link);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-(--line) bg-(--panel) px-4 py-20 shadow-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-(--line) border-t-(--sage)" />
          <p className="text-xs sm:text-sm font-medium text-(--muted)">Loading your runner profile...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-3xl border border-(--line) bg-(--panel) px-6 py-12 text-center sm:px-10 sm:py-16 shadow-premium">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage) shadow-sm">
          <Users className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight text-(--foreground)">
          Runner Sign In Required
        </h1>
        <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-(--muted)">
          Access your registered race bibs, GPS proof submission portal, and official certificates.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary px-6" href="/sign-in">
            Sign in
          </Link>
          <Link className="btn btn-secondary px-6" href="/sign-up">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const name = dbUser?.name || user?.fullName || user?.firstName || "Runner";
  const firstName = name.split(" ")[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* ── 1. PREMIUM RUNNER PROFILE HERO (Strava / Nike Style) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-(--line) bg-(--panel) p-5 sm:p-7 shadow-xs">
        {/* Soft Ambient Mesh */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 70% 60% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 60% 50% at 100% 100%, color-mix(in srgb, #eab308 10%, transparent) 0%, transparent 60%)",
            ].join(", "),
          }}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Runner Bio */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-(--sage) to-emerald-600 font-bold text-white text-lg sm:text-xl shadow-md ring-4 ring-(--sage)/20">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                name.slice(0, 2).toUpperCase()
              )}
              {verifiedFinishesCount > 0 && (
                <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs shadow">
                  🥇
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {isAdmin ? "Admin Ops Account" : "Verified Athlete"}
                </span>
                {verifiedFinishesCount > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" /> Finisher
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-xl sm:text-3xl font-black tracking-tight text-foreground">
                Hi, {firstName}
              </h1>
              <p className="text-xs text-(--muted) flex items-center gap-2 mt-0.5">
                <span>{user?.primaryEmailAddress?.emailAddress}</span>
              </p>
            </div>
          </div>

          {/* Clean Metric Counters (Total KM, Finishes, Active Events) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 border-t border-(--line) pt-4 lg:border-t-0 lg:pt-0">
            <div className="rounded-2xl border border-(--line) bg-(--panel-soft) p-3 text-center sm:px-5 sm:py-3.5">
              <p className="text-[0.6rem] font-bold uppercase tracking-wider text-(--muted)">
                Total Distance
              </p>
              <p className="mt-0.5 font-mono text-lg sm:text-2xl font-black text-foreground">
                {totalKmRun} <span className="text-xs font-semibold text-(--sage)">KM</span>
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-center sm:px-5 sm:py-3.5">
              <p className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Finisher Medals
              </p>
              <p className="mt-0.5 font-mono text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {verifiedFinishesCount} 🏅
              </p>
            </div>

            <div className="rounded-2xl border border-(--line) bg-(--panel-soft) p-3 text-center sm:px-5 sm:py-3.5">
              <p className="text-[0.6rem] font-bold uppercase tracking-wider text-(--muted)">
                Active Events
              </p>
              <p className="mt-0.5 font-mono text-lg sm:text-2xl font-black text-foreground">
                {activeRegistrations.length}
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Strip */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--line) pt-4">
          <div className="flex items-center gap-1.5 text-xs text-(--muted)">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>GPS Tracking · Automated Certificates · Doorstep Delivery</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="btn btn-secondary h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            {isAdmin && (
              <Link className="btn btn-secondary h-8 px-3 text-xs" href="/admin">
                Admin Console
              </Link>
            )}
            <Link className="btn btn-primary h-8 px-3.5 text-xs flex items-center gap-1" href="/events">
              <Plus className="h-3.5 w-3.5" /> Join an Event
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => void load()}
            className="font-bold underline cursor-pointer"
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {proofMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{proofMessage}</span>
        </div>
      )}

      {/* ── 2. ZERO-CLUTTER TAB NAVIGATION ───────────────────── */}
      <div className="flex items-center gap-2 border-b border-(--line) pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("active")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shrink-0",
            activeTab === "active"
              ? "bg-(--sage) text-white shadow-md shadow-(--sage)/20"
              : "border border-(--line) bg-(--panel) text-(--muted) hover:text-foreground",
          )}
        >
          <Route className="h-4 w-4" />
          <span>My Registered Events ({activeRegistrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("trophies")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shrink-0",
            activeTab === "trophies"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "border border-(--line) bg-(--panel) text-(--muted) hover:text-foreground",
          )}
        >
          <Trophy className="h-4 w-4" />
          <span>Trophy Cabinet & Medals ({trophyRegistrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("refer")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shrink-0",
            activeTab === "refer"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "border border-(--line) bg-(--panel) text-(--muted) hover:text-foreground",
          )}
        >
          <Gift className="h-4 w-4" />
          <span>Refer & Earn</span>
        </button>
      </div>

      {/* ── TAB 1: MY REGISTERED EVENTS (UNIFIED JOURNEY CARDS) ── */}
      {activeTab === "active" && (
        <div className="space-y-5">
          {activeRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--line) bg-(--panel) p-10 sm:p-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--panel-soft) text-(--muted)">
                <Medal className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-base sm:text-lg font-bold text-foreground">
                No active race registrations yet
              </h3>
              <p className="mt-1 max-w-sm text-xs sm:text-sm text-(--muted)">
                Choose your distance, get your official bib, and run at your own pace anywhere in India.
              </p>
              <Link className="btn btn-primary mt-6" href="/events">
                Explore Open Events <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ) : (
            activeRegistrations.map((reg) => {
              const isPaid = reg.payment?.status === "PAID" || reg.status === "CONFIRMED";
              const isProofSubmitted = reg.proofStatus === "SUBMITTED";
              const isVerified = reg.proofStatus === "APPROVED";
              const isCertReady = Boolean(reg.certificate && reg.certificate.status !== "QUEUED");
              const isMedalDispatched = Boolean(reg.medalDelivery && (reg.medalDelivery.status === "DISPATCHED" || reg.medalDelivery.status === "DELIVERED"));
              const formOpen = proofRegId === reg.id;

              return (
                <div
                  key={reg.id}
                  id={`reg-${reg.id}`}
                  className="rounded-3xl border border-(--line) bg-(--panel) overflow-hidden shadow-xs transition-all hover:shadow-md"
                >
                  {/* Event Card Header */}
                  <div className="p-4 sm:p-6 border-b border-(--line) bg-(--panel-soft)/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                          {reg.event.title}
                        </h2>
                        <span className="rounded-full bg-(--sage-soft) border border-(--sage)/30 px-2.5 py-0.5 font-mono text-xs font-bold text-(--sage)">
                          {reg.distance}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-(--muted)">
                        <span className="font-mono font-bold text-foreground">
                          Bib: {reg.bibNumber}
                        </span>
                        <span>·</span>
                        <span>
                          Joined{" "}
                          {new Date(reg.registeredAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Payment Status Pill */}
                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Paid {reg.payment?.amountInPaise ? formatMoney(reg.payment.amountInPaise) : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          Payment Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── 4-STEP RUNNER JOURNEY TRACK ── */}
                  <div className="p-4 sm:p-6 border-b border-(--line) bg-(--panel)">
                    <p className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider text-(--muted) mb-3">
                      Event Progress Pipeline
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                      {/* Step 1: Registered & Paid */}
                      <div
                        className={cn(
                          "rounded-2xl border p-3 transition-all",
                          isPaid
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              isPaid ? "bg-emerald-500 text-white" : "bg-amber-500 text-slate-950",
                            )}
                          >
                            1
                          </span>
                          <span className="text-xs font-bold">Registration</span>
                        </div>
                        <p className="mt-1.5 text-[0.65rem] sm:text-xs text-(--muted)">
                          {isPaid ? "Confirmed & Bib Assigned" : "Payment Required"}
                        </p>
                      </div>

                      {/* Step 2: GPS Proof Submission */}
                      <div
                        className={cn(
                          "rounded-2xl border p-3 transition-all",
                          isVerified
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                            : isProofSubmitted
                              ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                              : "border-(--line) bg-(--panel-soft) text-(--muted)",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              isVerified
                                ? "bg-emerald-500 text-white"
                                : isProofSubmitted
                                  ? "bg-amber-500 text-slate-950"
                                  : "bg-(--line) text-(--muted)",
                            )}
                          >
                            2
                          </span>
                          <span className="text-xs font-bold">GPS Activity</span>
                        </div>
                        <p className="mt-1.5 text-[0.65rem] sm:text-xs text-(--muted)">
                          {isVerified
                            ? "Proof Approved"
                            : isProofSubmitted
                              ? "Under Review (24-48h)"
                              : "Pending Run Upload"}
                        </p>
                      </div>

                      {/* Step 3: Verified Timing */}
                      <div
                        className={cn(
                          "rounded-2xl border p-3 transition-all",
                          isVerified
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                            : "border-(--line) bg-(--panel-soft) text-(--muted)",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              isVerified ? "bg-emerald-500 text-white" : "bg-(--line) text-(--muted)",
                            )}
                          >
                            3
                          </span>
                          <span className="text-xs font-bold">Official Time</span>
                        </div>
                        <p className="mt-1.5 text-[0.65rem] sm:text-xs font-mono font-bold text-foreground">
                          {isVerified && reg.finishTimeSeconds
                            ? formatDuration(reg.finishTimeSeconds)
                            : "Awaiting Verification"}
                        </p>
                      </div>

                      {/* Step 4: Certificate & Rewards */}
                      <div
                        className={cn(
                          "rounded-2xl border p-3 transition-all",
                          isCertReady
                            ? "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                            : "border-(--line) bg-(--panel-soft) text-(--muted)",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              isCertReady ? "bg-amber-500 text-slate-950" : "bg-(--line) text-(--muted)",
                            )}
                          >
                            4
                          </span>
                          <span className="text-xs font-bold">Rewards Kit</span>
                        </div>
                        <p className="mt-1.5 text-[0.65rem] sm:text-xs text-(--muted)">
                          {isCertReady
                            ? isMedalDispatched
                              ? "Medal On The Way"
                              : "Certificate Ready"
                            : "Unlocked on Finish"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── ACTION HUB BAR ── */}
                  <div className="p-4 sm:p-5 bg-(--panel-soft)/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        className="btn btn-secondary h-9 px-3.5 text-xs inline-flex items-center gap-1.5"
                        href={`/events/${reg.event.slug}`}
                      >
                        Event Page <ExternalLink className="h-3 w-3" />
                      </Link>

                      <Link
                        className="btn btn-secondary h-9 px-3.5 text-xs inline-flex items-center gap-1.5"
                        href={`/leaderboard?event=${reg.event.slug}&distance=${encodeURIComponent(reg.distance)}`}
                      >
                        Leaderboard <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      </Link>

                      {isCertReady && (
                        <Link
                          className="btn btn-primary h-9 px-3.5 text-xs inline-flex items-center gap-1.5"
                          href={`/certificates/${reg.certificate!.certificateNumber}`}
                        >
                          <Award className="h-3.5 w-3.5" /> View Certificate
                        </Link>
                      )}

                      {reg.medalDelivery?.trackingNumber && (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-(--line) bg-(--panel) px-3 py-1.5 text-xs text-(--muted)">
                          <Truck className="h-3.5 w-3.5 text-(--sage)" />
                          Tracking: <span className="font-mono font-bold text-foreground">{reg.medalDelivery.trackingNumber}</span>
                        </span>
                      )}
                    </div>

                    {/* Primary Action Button */}
                    <div>
                      {!isPaid ? (
                        <Link
                          className="btn btn-primary h-9 px-4 text-xs font-bold"
                          href={`/register?event=${reg.event?.slug || 'sports-day-celebration'}&distance=${encodeURIComponent(reg.distance)}`}
                        >
                          Complete Payment →
                        </Link>
                      ) : canUpload(reg) ? (
                        <button
                          onClick={() => {
                            setProofRegId(formOpen ? null : reg.id);
                            setProofMessage(null);
                            setProofError(null);
                          }}
                          className={cn(
                            "h-9 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5",
                            formOpen
                              ? "border border-(--line) bg-(--panel) text-(--muted)"
                              : "btn btn-primary shadow-md shadow-(--sage)/20",
                          )}
                          type="button"
                        >
                          <UploadCloud className="h-4 w-4" />
                          {formOpen ? "Close Uploader" : "Upload GPS Run Proof"}
                        </button>
                      ) : isProofSubmitted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" /> Proof Under Review
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* ── INLINE GPS PROOF SUBMISSION DRAWER ── */}
                  {formOpen && (
                    <form
                      className="border-t border-(--line) bg-(--panel-soft) p-4 sm:p-6"
                      onSubmit={submitProof}
                      noValidate
                    >
                      <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                            <UploadCloud className="h-4 w-4 text-(--sage)" />
                            Submit GPS Proof for {reg.event.title} ({reg.distance})
                          </h3>
                          <button
                            type="button"
                            onClick={() => setProofRegId(null)}
                            className="text-(--muted) hover:text-foreground cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {proofError && (
                          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            {proofError}
                          </div>
                        )}

                        <label className="block">
                          <span className="block text-xs font-bold uppercase tracking-wider text-(--muted) mb-1.5">
                            Activity Screenshot (Strava / Nike / Garmin)
                          </span>
                          <input
                            accept="image/*"
                            className="input cursor-pointer py-2 file:mr-3 file:rounded-xl file:border-0 file:bg-(--sage) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                            disabled={proofBusy}
                            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                            type="file"
                          />
                          {proofFileName && (
                            <p className="mt-1.5 text-xs font-medium text-(--sage)">Ready: {proofFileName}</p>
                          )}
                        </label>

                        {proofUrl && (proofUrl.startsWith("data:") || /\.(png|jpe?g|webp)/i.test(proofUrl)) && (
                          <div className="overflow-hidden rounded-xl border border-(--line) bg-(--panel) max-w-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img alt="Preview" className="max-h-48 w-full object-contain" src={proofUrl} />
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="block text-xs font-bold uppercase tracking-wider text-(--muted) mb-1.5">
                              Tracking App
                            </span>
                            <select
                              className="input w-full text-xs font-medium"
                              onChange={(e) => setSourceApp(e.target.value)}
                              required
                              value={sourceApp}
                            >
                              {SOURCE_APPS.map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                          </label>

                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-(--muted) mb-1.5">
                              Finish Time (Optional)
                            </span>
                            <div className="flex items-center gap-1.5">
                              <input
                                ref={hoursInputRef}
                                aria-label="Hours"
                                className="input text-center font-mono text-xs font-bold h-10 w-16"
                                max={23}
                                min={0}
                                onPaste={handleTimePaste}
                                onChange={(e) => {
                                  const val = e.target.value.slice(0, 2);
                                  setFinishHours(val);
                                  if (val.length === 2 && minutesInputRef.current) {
                                    minutesInputRef.current.focus();
                                  }
                                }}
                                placeholder="HH"
                                type="number"
                                value={finishHours}
                              />
                              <span className="font-mono text-sm text-(--muted)">:</span>
                              <input
                                ref={minutesInputRef}
                                aria-label="Minutes"
                                className="input text-center font-mono text-xs font-bold h-10 w-16"
                                max={59}
                                min={0}
                                onPaste={handleTimePaste}
                                onChange={(e) => {
                                  const val = e.target.value.slice(0, 2);
                                  setFinishMinutes(val);
                                  if (val.length === 2 && secondsInputRef.current) {
                                    secondsInputRef.current.focus();
                                  }
                                }}
                                placeholder="MM"
                                type="number"
                                value={finishMinutes}
                              />
                              <span className="font-mono text-sm text-(--muted)">:</span>
                              <input
                                ref={secondsInputRef}
                                aria-label="Seconds"
                                className="input text-center font-mono text-xs font-bold h-10 w-16"
                                max={59}
                                min={0}
                                onPaste={handleTimePaste}
                                onChange={(e) => {
                                  setFinishSeconds(e.target.value.slice(0, 2));
                                }}
                                placeholder="SS"
                                type="number"
                                value={finishSeconds}
                              />
                            </div>
                          </div>
                        </div>

                        {formattedTimePreview && (
                          <p className="text-xs text-(--sage) font-medium">
                            ⏱ Entered Time: {formattedTimePreview.label} ({formattedTimePreview.digital})
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            className="btn btn-primary h-9 px-4 text-xs font-bold cursor-pointer"
                            disabled={proofBusy}
                            type="submit"
                          >
                            {proofBusy ? "Submitting..." : "Submit Proof"}
                          </button>
                          <button
                            className="btn btn-secondary h-9 px-3 text-xs cursor-pointer"
                            onClick={() => {
                              setProofRegId(null);
                              setProofUrl("");
                              setProofFileName(null);
                              setProofError(null);
                            }}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 2: TROPHY CABINET & CERTIFICATES ──────────────── */}
      {activeTab === "trophies" && (
        <div className="space-y-6">
          {trophyRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--line) bg-(--panel) p-10 sm:p-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 text-2xl">
                🏆
              </span>
              <h3 className="mt-4 text-base sm:text-lg font-bold text-foreground">
                Trophy Cabinet is currently empty
              </h3>
              <p className="mt-1 max-w-sm text-xs sm:text-sm text-(--muted)">
                Complete any virtual race and upload your GPS activity to unlock your official e-certificate and medal tracking!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {trophyRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-3xl border border-amber-500/30 bg-linear-to-b from-amber-500/5 via-(--panel) to-(--panel) p-5 sm:p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Official Finisher 🥇
                      </span>
                      <span className="font-mono text-xs text-(--muted)">Bib: {reg.bibNumber}</span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-foreground">{reg.event.title}</h3>
                    <p className="text-xs text-(--sage) font-semibold">{reg.distance} Category</p>

                    {reg.finishTimeSeconds && (
                      <p className="mt-2 text-xs text-(--muted)">
                        Official Finish Time:{" "}
                        <strong className="text-foreground font-mono">
                          {formatDuration(reg.finishTimeSeconds)}
                        </strong>
                      </p>
                    )}

                    {/* Medal Delivery Info */}
                    {reg.medalDelivery && (
                      <div className="mt-3 rounded-xl border border-(--line) bg-(--panel-soft) p-3 text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Medal className="h-3.5 w-3.5 text-amber-500" /> Medal Status:{" "}
                          <span className="text-(--sage)">{reg.medalDelivery.status}</span>
                        </p>
                        {reg.medalDelivery.trackingNumber && (
                          <p className="mt-1 text-(--muted) font-mono text-[0.7rem]">
                            Courier: {reg.medalDelivery.courier || "SpeedPost"} · {reg.medalDelivery.trackingNumber}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-(--line) flex items-center gap-2">
                    {reg.certificate && reg.certificate.status !== "QUEUED" ? (
                      <Link
                        className="btn btn-primary h-9 w-full text-xs font-bold flex items-center justify-center gap-1.5"
                        href={`/certificates/${reg.certificate.certificateNumber}`}
                      >
                        <Award className="h-4 w-4" /> Download Certificate
                      </Link>
                    ) : (
                      <span className="text-xs text-(--muted) text-center w-full">
                        Certificate generating upon verification...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: REFER & EARN REWARDS ──────────────────────── */}
      {activeTab === "refer" && (
        <div className="rounded-3xl border border-(--line) bg-(--panel) p-6 sm:p-8 shadow-xs">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Gift className="h-3.5 w-3.5" /> Referral Program
            </span>
            <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Invite Friends, Earn Free Race Entries
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-(--muted) leading-relaxed">
              Share your unique runner link with running clubs, friends, and family. Get rewarded for every friend who joins any Mountain Run event!
            </p>

            {/* Referral Link Box */}
            <div className="mt-6 rounded-2xl border border-(--line) bg-(--panel-soft) p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) mb-2">
                Your Unique Runner Link
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://mountainrun.in/register?ref=${dbUser?.referralCode || user?.id?.slice(-6) || "MOUNTAINRUN"}`}
                  className="input font-mono text-xs w-full bg-(--panel)"
                />
                <button
                  onClick={handleCopyReferral}
                  className="btn btn-primary h-10 px-4 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
                  type="button"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedCode ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-(--line) p-4">
                <h4 className="text-xs font-bold text-foreground">1. Share Your Link</h4>
                <p className="mt-1 text-[0.7rem] text-(--muted)">
                  Send your link on WhatsApp, Strava, or Instagram.
                </p>
              </div>
              <div className="rounded-2xl border border-(--line) p-4">
                <h4 className="text-xs font-bold text-foreground">2. Earn Free Kit & Discounts</h4>
                <p className="mt-1 text-[0.7rem] text-(--muted)">
                  Get coupon codes applied automatically to future race registrations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
