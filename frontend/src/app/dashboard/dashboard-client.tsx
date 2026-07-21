"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";
import { CalendarDays, Target, ArrowUpRight, Users, Medal, FileBadge, Eye, Clock, Ruler } from "lucide-react";

type Registration = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  finishTimeSeconds?: number | null;
  registeredAt: string;
  event: { title: string; slug: string };
  payment: { status: string; amountInPaise: number } | null;
  proofUpload?: { activityImageUrl: string; sourceApp: string; status: string; reviewerNote?: string | null } | null;
  certificate?: { certificateNumber: string; status: string; pdfUrl?: string | null } | null;
  medalDelivery?: { status: string; trackingNumber: string | null; trackingUrl?: string | null; courier?: string | null } | null;
};

type DbUser = {
  id: string; name: string; email: string; phone: string | null;
  clerkId: string | null; role?: string; registrations: Registration[];
};

const SOURCE_APPS = ["Strava", "Garmin Connect", "Nike Run Club", "Adidas Running", "Apple Fitness", "Google Fit", "MapMyRun", "Other"];

function formatMoney(paise: number) { return `\u20B9${(paise / 100).toFixed(0)}`; }

function badgeClass(status: string) {
  const m: Record<string, string> = {
    CONFIRMED: "badge-sage", PAID: "badge-sage", APPROVED: "badge-sage",
    PENDING_PAYMENT: "badge", CREATED: "badge", SUBMITTED: "badge-warn",
    REJECTED: "badge-danger", NOT_SUBMITTED: "badge",
    GENERATED: "badge-sage", SENT: "badge-sage",
    DISPATCHED: "badge-sage", DELIVERED: "badge-sage", QUEUED: "badge",
  };
  return m[status] ?? "badge";
}

function labelStatus(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "Confirmed",
    PENDING_PAYMENT: "Payment pending",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
    NOT_SUBMITTED: "Not submitted",
    SUBMITTED: "Under review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CREATED: "Awaiting payment",
    PAID: "Paid",
    FAILED: "Payment failed",
    REFUNDED: "Refunded",
    QUEUED: "Processing",
    GENERATED: "Ready",
    SENT: "Sent",
    PENDING: "Pending",
    DISPATCHED: "Dispatched",
    DELIVERED: "Delivered",
    RETURNED: "Returned",
    NOT_ELIGIBLE: "Not eligible",
  };
  return map[status] ?? status.replaceAll("_", " ").toLowerCase();
}

function isEligible(reg: Registration) { return reg.status === "CONFIRMED" || reg.status === "COMPLETED" || reg.payment?.status === "PAID"; }
function canUpload(reg: Registration) { return isEligible(reg) && (reg.proofStatus === "NOT_SUBMITTED" || reg.proofStatus === "REJECTED"); }
function dedupe(rows: Registration[]) { const s = new Set<string>(); return rows.filter((r) => { if (s.has(r.id)) return false; s.add(r.id); return true; }); }

async function fileToPayload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8 MB.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  const ctx = c.getContext("2d")!; ctx.drawImage(bmp, 0, 0, c.width, c.height); bmp.close();
  return c.toDataURL("image/jpeg", 0.82);
}

function StatCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--line) bg-(--panel) px-4 py-4 transition-shadow hover:shadow-sm sm:gap-4 sm:px-5 sm:py-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight tabular-nums text-(--foreground) sm:text-3xl">{value}</p>
        <p className="text-xs text-(--muted-soft)">{label}</p>
      </div>
    </div>
  );
}

export function DashboardClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [proofRegId, setProofRegId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [sourceApp, setSourceApp] = useState("Strava");
  const [finishMinutes, setFinishMinutes] = useState("");
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const id = ++seq.current;
    if (!isSignedIn) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Could not get session token.");
      await fetch(getApiUrl("/api/users/sync"), { method: "POST", headers: authHeaders(token), body: JSON.stringify({ clerkId: user?.id, email: user?.primaryEmailAddress?.emailAddress, name: user?.fullName ?? user?.firstName, phone: user?.primaryPhoneNumber?.phoneNumber, avatarUrl: user?.imageUrl }) });
      const res = await fetch(getApiUrl("/api/users/me"), { headers: authHeaders(token) });
      if (!res.ok) throw new Error(await readApiError(res, "Could not load dashboard"));
      const json = await res.json();
      if (seq.current === id) setDbUser(json.data as DbUser);
    } catch (err) { if (seq.current === id) setError(err instanceof Error ? err.message : "Failed to load"); }
    finally { if (seq.current === id) setLoading(false); }
  }, [getToken, isSignedIn, user]);

  useEffect(() => { if (isLoaded) { const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); } }, [isLoaded, load]);

  const registrations = useMemo(() => dedupe(dbUser?.registrations ?? []), [dbUser]);
  const isAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "SUPER_ADMIN";
  const needsProof = useMemo(() => registrations.filter(canUpload), [registrations]);
  const waitingReview = useMemo(() => registrations.filter((r) => r.proofStatus === "SUBMITTED"), [registrations]);

  async function onPickFile(file: File | null) {
    setProofError(null); setProofFileName(null); setProofUrl("");
    if (!file) return;
    try { setProofBusy(true); setProofUrl(await fileToPayload(file)); setProofFileName(file.name); }
    catch (err) { setProofError(err instanceof Error ? err.message : "Could not read image"); }
    finally { setProofBusy(false); }
  }

  async function submitProof(e: FormEvent) {
    e.preventDefault(); if (!proofRegId) return;
    setProofBusy(true); setProofMessage(null); setProofError(null);
    try {
      const token = await getToken(); if (!token) throw new Error("Sign in again.");
      let url = proofUrl.trim(); if (!url) throw new Error("Upload a screenshot or paste an image URL.");
      if (url.startsWith("data:") || url.startsWith("https://")) {
        const up = await fetch(getApiUrl("/api/uploads/image"), { method: "POST", headers: authHeaders(token), body: JSON.stringify({ file: url, folder: "mountainrun/proofs" }) });
        if (!up.ok) { if (!url.startsWith("https://")) throw new Error(await readApiError(up, "Image upload failed")); }
        else url = (await up.json()).data.url;
      }
      const mins = Number(finishMinutes);
      const secs = Number.isFinite(mins) && mins > 0 ? Math.round(mins * 60) : undefined;
      const res = await fetch(getApiUrl(`/api/registrations/${proofRegId}/proof`), { method: "POST", headers: authHeaders(token), body: JSON.stringify({ activityImageUrl: url, sourceApp: sourceApp.trim() || "Other", finishTimeSeconds: secs }) });
      if (!res.ok) throw new Error(await readApiError(res, "Proof submit failed"));
      setProofMessage("Proof submitted. You'll get a certificate email after admin approval.");
      setProofRegId(null); setProofUrl(""); setProofFileName(null); setFinishMinutes("");
      await load();
    } catch (err) { setProofError(err instanceof Error ? err.message : "Proof submit failed"); }
    finally { setProofBusy(false); }
  }

  if (!isLoaded || loading) return (
    <div className="flex items-center justify-center rounded-2xl border border-(--line) bg-(--panel) px-4 py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--line-strong) border-t-(--sage)" />
        <p className="text-sm text-(--muted)">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (!isSignedIn) return (
    <div className="rounded-2xl border border-(--line) bg-(--panel) px-6 py-10 text-center sm:px-10 sm:py-14">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage)">
        <Users className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">Sign in required</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-(--muted)">
        Your dashboard shows registrations, payments, and proof status. Sign in to continue.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="btn btn-primary" href="/sign-in">Sign in</Link>
        <Link className="btn btn-secondary" href="/sign-up">Create account</Link>
      </div>
    </div>
  );

  const name = dbUser?.name || user?.fullName || user?.firstName || "Runner";
  const registeredCount = registrations.filter((r) => r.status !== "CANCELLED").length;
  const proofedCount = registrations.filter((r) => r.proofStatus === "SUBMITTED" || r.proofStatus === "APPROVED").length;
  const certCount = registrations.filter((r) => r.certificate && r.certificate.status !== "QUEUED").length;

  return (
    <div className="space-y-8 sm:space-y-10">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{isAdmin ? "Admin account" : "Dashboard"}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">
            Hi, {name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--muted)">
            {isAdmin
              ? "You have ops access. Manage proofs, certificates, medals from the admin console."
              : "Track your races, upload GPS proof, and download certificates."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin ? <Link className="btn btn-primary" href="/admin">Admin console</Link> : null}
          <Link className="btn btn-secondary" href="/events">Join an event</Link>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-(--danger)/20 bg-(--danger)/8 px-4 py-3 text-sm text-(--danger)">
          <span>{error}</span>
          <button className="ml-auto cursor-pointer font-medium underline" onClick={() => void load()} type="button">Retry</button>
        </div>
      ) : null}

      {/* ── STATS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard icon={CalendarDays} label="Registrations" value={registeredCount} />
        <StatCard icon={Eye} label="Proofs submitted" value={proofedCount} />
        <StatCard icon={FileBadge} label="Certificates" value={certCount} />
      </div>

      {/* ── REFERRAL ───────────────────────────────────────── */}
      <Link
        href="/refer"
        className="group flex items-center justify-between gap-4 rounded-xl border border-(--line) bg-(--panel) px-5 py-4 transition-all hover:border-(--sage)/30 hover:shadow-sm sm:px-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--sage-soft) text-(--sage)">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-(--foreground)">Refer & earn</p>
            <p className="mt-0.5 text-xs text-(--muted)">Invite friends, earn rewards on every registration</p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-(--muted-soft) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>

      {/* ── HOW IT WORKS (empty state) ─────────────────────── */}
      {registeredCount === 0 ? (
        <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
          <h2 className="text-lg font-bold tracking-tight text-(--foreground)">How it works</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[
              { step: "1", title: "Join an event", desc: "Choose a distance, pay, and get your bib instantly.", icon: CalendarDays },
              { step: "2", title: "Run anywhere", desc: "Complete your distance during the event window using any GPS app.", icon: Target },
              { step: "3", title: "Upload proof", desc: "Submit your GPS screenshot. Admin verifies it within 24-48 hours.", icon: Eye },
              { step: "4", title: "Get rewards", desc: "Receive your e-certificate and medal once approved.", icon: Medal },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage)">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <p className="mt-3 text-sm font-bold text-(--foreground)">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-(--muted)">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link className="btn btn-primary" href="/events">Browse open events <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      ) : null}

      {/* ── PROOF REMINDER ─────────────────────────────────── */}
      {needsProof.length > 0 ? (
        <div className="rounded-2xl border border-(--sage)/25 bg-(--sage-soft)/50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--sage) text-white">
                <Eye className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-(--foreground)">
                  {needsProof.length} registration{needsProof.length === 1 ? "" : "s"} need GPS proof
                </p>
                <p className="mt-1 text-sm text-(--muted)">
                  Finished your run? Upload a GPS screenshot to get verified and unlock your certificate + medal.
                </p>
              </div>
            </div>
            <button
              className="btn btn-primary shrink-0 cursor-pointer"
              onClick={() => {
                const t = needsProof[0];
                setProofRegId(t.id);
                setProofMessage(null);
                setProofError(null);
                document.getElementById(`reg-${t.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              type="button"
            >
              Upload proof <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Run with GPS on", "Screenshot activity", "Upload & wait for approval"].map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-(--panel)/80 px-3 py-1.5 text-xs text-(--muted)">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-(--sage) text-[0.55rem] font-bold text-white">{i + 1}</span>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── WAITING REVIEW ─────────────────────────────────── */}
      {waitingReview.length > 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-(--line) bg-(--panel-soft) px-4 py-3 text-sm text-(--muted)">
          <Clock className="h-4 w-4 shrink-0 text-(--sage)" />
          <span>
            {waitingReview.length} proof{waitingReview.length === 1 ? "" : "s"} waiting for admin review.
          </span>
        </div>
      ) : null}

      {proofMessage ? (
        <div className="rounded-xl border border-(--sage)/30 bg-(--sage-soft) px-4 py-3 text-sm text-(--sage)">
          {proofMessage}
        </div>
      ) : null}

      {/* ── REWARDS ──────────────────────────────────────────── */}
      {registrations.some((r) => r.proofStatus === "SUBMITTED" || r.proofStatus === "APPROVED") ? (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-(--foreground)">Rewards</h2>
            <p className="mt-1 text-sm text-(--muted)">Your certificates and medal delivery status.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {registrations.filter((r) => r.proofStatus === "SUBMITTED" || r.proofStatus === "APPROVED").map((reg) => (
              <div key={reg.id} className="rounded-xl border border-(--line) bg-(--panel) p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-(--foreground)">{reg.event.title}</p>
                    <p className="mt-0.5 text-xs text-(--muted)">{reg.distance}</p>
                  </div>
                  <span className={`shrink-0 ${badgeClass(reg.proofStatus)}`}>
                    {reg.proofStatus === "APPROVED" ? "Verified" : "Under review"}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-(--panel-soft) px-3 py-2">
                    <span className="text-xs font-medium text-(--muted)">Certificate</span>
                    <span className={`${reg.certificate && reg.certificate.status !== "QUEUED" ? badgeClass(reg.certificate.status) : "badge"}`}>
                      {reg.certificate
                        ? reg.certificate.status === "SENT" ? "Emailed"
                          : reg.certificate.status === "GENERATED" ? "Ready"
                          : "Processing"
                        : "After verification"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-(--panel-soft) px-3 py-2">
                    <span className="text-xs font-medium text-(--muted)">Medal</span>
                    <span className={`${reg.medalDelivery ? badgeClass(reg.medalDelivery.status) : "badge"}`}>
                      {reg.medalDelivery
                        ? reg.medalDelivery.status === "DELIVERED" ? "Delivered"
                          : reg.medalDelivery.status === "DISPATCHED" ? "On the way"
                          : "Preparing"
                        : "After verification"}
                    </span>
                  </div>
                </div>

                {reg.medalDelivery?.trackingNumber ? (
                  <div className="mt-3 space-y-1 rounded-lg bg-(--panel-soft) px-3 py-2.5 text-xs text-(--muted)">
                    {reg.medalDelivery.courier && <p>Courier: <span className="font-medium text-(--foreground)">{reg.medalDelivery.courier}</span></p>}
                    <p>Tracking: <span className="font-mono font-medium text-(--foreground)">{reg.medalDelivery.trackingNumber}</span></p>
                    {reg.medalDelivery.trackingUrl && (
                      <a className="inline-flex items-center gap-1 text-(--sage) underline-offset-2 hover:underline" href={reg.medalDelivery.trackingUrl} rel="noopener noreferrer" target="_blank">
                        Track package <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ) : null}

                {reg.certificate && (reg.certificate.status === "SENT" || reg.certificate.status === "GENERATED") ? (
                  <Link className="btn btn-secondary mt-3 h-9 w-full text-xs" href={`/certificates/${reg.certificate.certificateNumber}`}>
                    View certificate <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── REGISTRATIONS ─────────────────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight text-(--foreground)">My registrations</h2>
          <p className="mt-1 text-sm text-(--muted)">All your events — payments, proof uploads, and certificates.</p>
        </div>

        {registrations.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-(--line) bg-(--panel-soft)/50 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--panel) text-(--muted-soft)">
              <Medal className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-medium text-(--foreground)">No registrations yet</p>
            <p className="mt-1 text-sm text-(--muted)">Join an event to start your journey.</p>
            <Link className="btn btn-primary mt-6" href="/events">Browse events <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => {
              const uploadOk = canUpload(reg);
              const formOpen = proofRegId === reg.id;
              return (
                <div key={reg.id} id={`reg-${reg.id}`} className="rounded-xl border border-(--line) bg-(--panel)">
                  {/* Card header */}
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-base font-bold tracking-tight text-(--foreground)">{reg.event.title}</p>
                        <span className={`shrink-0 ${badgeClass(reg.status)}`}>{labelStatus(reg.status)}</span>
                      </div>
                      <p className="mt-1 text-sm text-(--muted)">{reg.distance}</p>
                      <p className="text-xs text-(--muted-soft)">
                        Joined {new Date(reg.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Badge row */}
                  <div className="flex flex-wrap gap-1.5 px-4 pb-1 sm:px-5">
                    {reg.proofStatus === "SUBMITTED" && <span className="badge badge-warn">Run under review</span>}
                    {reg.proofStatus === "APPROVED" && <span className="badge badge-sage">Run verified</span>}
                    {reg.proofStatus === "REJECTED" && <span className="badge badge-danger">Proof rejected</span>}
                    {reg.payment?.status === "CREATED" && (
                      <span className="badge">
                        Payment pending{reg.payment.amountInPaise ? ` — ${formatMoney(reg.payment.amountInPaise)}` : ""}
                      </span>
                    )}
                    {reg.payment?.status === "PAID" && reg.payment.amountInPaise > 0 && (
                      <span className="badge badge-sage">{formatMoney(reg.payment.amountInPaise)} paid</span>
                    )}
                    {reg.certificate?.status === "SENT" && <span className="badge badge-sage">Certificate emailed</span>}
                    {reg.medalDelivery?.status === "DISPATCHED" && <span className="badge badge-sage">Medal on the way</span>}
                    {reg.medalDelivery?.status === "DELIVERED" && <span className="badge badge-solid">Medal delivered</span>}
                  </div>

                  {reg.proofStatus === "REJECTED" && reg.proofUpload?.reviewerNote ? (
                    <div className="mx-4 mt-3 rounded-lg border border-(--danger)/20 bg-(--danger)/8 px-3 py-2 text-xs text-(--danger) sm:mx-5">
                      Rejected: {reg.proofUpload.reviewerNote}. Upload a clearer GPS screenshot.
                    </div>
                  ) : null}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-(--line) px-4 py-3 sm:px-5">
                    <Link className="btn btn-secondary h-8 px-3 text-xs" href={`/events/${reg.event.slug}`}>
                      Event details <ArrowUpRight className="h-3 w-3" />
                    </Link>
                    {(reg.status === "PENDING_PAYMENT" || reg.payment?.status === "CREATED") ? (
                      <Link className="btn btn-primary h-8 px-3 text-xs" href="/register">
                        Complete payment
                      </Link>
                    ) : null}
                    {uploadOk ? (
                      <button
                        className={`h-8 cursor-pointer rounded-full px-3 text-xs font-medium transition-colors ${
                          formOpen
                            ? "bg-(--panel-soft) text-(--muted) border border-(--line)"
                            : "btn btn-primary"
                        }`}
                        onClick={() => {
                          setProofRegId(formOpen ? null : reg.id);
                          setProofMessage(null);
                          setProofError(null);
                        }}
                        type="button"
                      >
                        {formOpen ? "Close" : "Upload GPS proof"}
                      </button>
                    ) : null}
                    {reg.proofStatus === "SUBMITTED" ? (
                      <span className="inline-flex h-8 items-center gap-1 rounded-full border border-(--line) px-3 text-xs text-(--muted)">
                        <Clock className="h-3 w-3" /> Under review
                      </span>
                    ) : null}
                    {reg.certificate && reg.certificate.status !== "QUEUED" ? (
                      <Link className="btn btn-secondary h-8 px-3 text-xs" href={`/certificates/${reg.certificate.certificateNumber}`}>
                        Certificate <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    ) : null}
                    {!isEligible(reg) && reg.status !== "PENDING_PAYMENT" ? (
                      <span className="text-xs text-(--muted-soft)">Pay to unlock proof upload</span>
                    ) : null}
                  </div>

                  {/* Proof form */}
                  {formOpen ? (
                    <form className="border-t border-(--line) bg-(--panel-soft) p-4 sm:p-5" onSubmit={submitProof}>
                      <div className="space-y-4">
                        <p className="text-sm font-bold text-(--foreground)">Upload GPS proof</p>

                        {proofError ? (
                          <p className="rounded-lg border border-(--danger)/20 bg-(--danger)/8 px-3 py-2 text-xs text-(--danger)">{proofError}</p>
                        ) : null}

                        <label className="block">
                          <span className="field-label">Screenshot</span>
                          <input
                            accept="image/*"
                            className="input cursor-pointer py-2 file:mr-3 file:rounded-full file:border-0 file:bg-(--sage) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                            disabled={proofBusy}
                            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                            type="file"
                          />
                          {proofFileName ? <p className="mt-1.5 text-xs text-(--sage)">Ready: {proofFileName}</p> : null}
                        </label>

                        <label className="block">
                          <span className="field-label">Or paste image URL</span>
                          <input
                            className="input"
                            disabled={proofBusy || Boolean(proofFileName)}
                            onChange={(e) => { setProofUrl(e.target.value); setProofFileName(null); }}
                            placeholder="https://..."
                            type="url"
                            value={proofFileName ? "" : proofUrl.startsWith("data:") ? "" : proofUrl}
                          />
                        </label>

                        {proofUrl && (proofUrl.startsWith("data:") || /\.(png|jpe?g|webp)/i.test(proofUrl)) ? (
                          <div className="overflow-hidden rounded-lg border border-(--line) bg-(--panel)">
                            <img alt="Preview" className="max-h-48 w-full object-contain" src={proofUrl} />
                          </div>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-sm">
                            <span className="field-label">Source app</span>
                            <select className="input" onChange={(e) => setSourceApp(e.target.value)} required value={sourceApp}>
                              {SOURCE_APPS.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </label>
                          <label className="block text-sm">
                            <span className="field-label">Finish time (minutes)</span>
                            <input
                              className="input"
                              inputMode="decimal"
                              onChange={(e) => setFinishMinutes(e.target.value)}
                              placeholder="e.g. 52"
                              value={finishMinutes}
                            />
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button className="btn btn-primary h-9 cursor-pointer" disabled={proofBusy} type="submit">
                            {proofBusy ? "Submitting..." : "Submit proof"}
                          </button>
                          <button
                            className="btn btn-ghost h-9 cursor-pointer"
                            onClick={() => { setProofRegId(null); setProofUrl(""); setProofFileName(null); setProofError(null); }}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
