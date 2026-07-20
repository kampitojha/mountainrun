"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";
import { CalendarDays, Target, IndianRupee, ArrowUpRight, Users, Medal, FileBadge, Sparkles, Eye, Clock, ChevronRight } from "lucide-react";

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
  const paidCount = registrations.filter(isEligible).length;

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

  if (!isLoaded || loading) return <div className="card p-10 text-center"><p className="text-sm text-(--muted)">Loading your dashboard...</p></div>;

  if (!isSignedIn) return (
    <div className="card p-8 text-center sm:p-10">
      <p className="eyebrow">Account</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in required</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-(--muted)">Your dashboard shows registrations, payments, and proof status. Sign in to continue.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="btn btn-primary" href="/sign-in">Sign in</Link>
        <Link className="btn btn-secondary" href="/sign-up">Create account</Link>
      </div>
    </div>
  );

  const name = dbUser?.name || user?.fullName || user?.firstName || "Runner";
  const email = dbUser?.email || user?.primaryEmailAddress?.emailAddress || "\u2014";
  const registeredCount = registrations.filter((r) => r.status !== "CANCELLED").length;
  const proofedCount = registrations.filter((r) => r.proofStatus === "SUBMITTED" || r.proofStatus === "APPROVED").length;
  const certCount = registrations.filter((r) => r.certificate && r.certificate.status !== "QUEUED").length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{isAdmin ? "Admin account" : "Dashboard"}</p>
          <h1 className="display mt-2">Hi, {name.split(" ")[0]}</h1>
          <p className="lede mt-2 max-w-xl">
            {isAdmin ? "You have ops access. Manage proofs, certificates, medals from the admin console." : "Track races, upload GPS proof after your run, and download certificates."}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin ? <Link className="btn btn-primary" href="/admin">Admin console</Link> : null}
          <Link className="btn btn-primary" href="/events">Join an event</Link>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-(--danger)/20 bg-(--danger)/8 px-4 py-3 text-sm text-(--danger)">{error} <button className="underline cursor-pointer" onClick={() => void load()} type="button">Retry</button></div> : null}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Registrations", value: registeredCount, icon: CalendarDays },
          { label: "Proofs submitted", value: proofedCount, icon: Eye },
          { label: "Certificates", value: certCount, icon: FileBadge },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-(--line) bg-(--panel) p-4 text-center sm:p-5">
            <Icon className="mx-auto h-4 w-4 text-(--muted-soft)" />
            <p className="mt-2 text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">{value}</p>
            <p className="mt-0.5 text-xs text-(--muted-soft)">{label}</p>
          </div>
        ))}
      </div>

      {/* How it works - shown when user has no eligible registrations */}
      {registeredCount === 0 ? (
        <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
          <h2 className="text-lg font-bold tracking-tight text-(--foreground)">How it works</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {[
              { step: "1", title: "Join an event", desc: "Choose a distance, pay, and get your bib number instantly.", icon: CalendarDays },
              { step: "2", title: "Run anywhere", desc: "Complete your distance during the event window using any GPS app.", icon: Target },
              { step: "3", title: "Upload proof", desc: "Submit your GPS screenshot. Admin verifies it within 24\u201348 hours.", icon: ArrowUpRight },
              { step: "4", title: "Get rewards", desc: "Receive your e-certificate and medal once approved.", icon: Medal },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-(--sage-soft) text-(--sage)"><Icon className="h-5 w-5" /></span>
                <p className="mt-3 text-sm font-bold text-(--foreground)">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-(--muted)">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link className="btn btn-primary" href="/events">Browse open events <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      ) : null}

      {/* Proof action strip */}
      {needsProof.length > 0 ? (
        <div className="rounded-2xl border border-(--sage)/25 bg-(--sage-soft)/40 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-(--foreground)">Upload GPS proof ({needsProof.length} pending)</p>
              <p className="mt-1 text-sm text-(--muted)">Finished your run? Upload a GPS screenshot to get verified and unlock your certificate + medal.</p>
            </div>
            <button className="btn btn-primary shrink-0 cursor-pointer" onClick={() => { const t = needsProof[0]; setProofRegId(t.id); setProofMessage(null); setProofError(null); document.getElementById(`reg-${t.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }} type="button">
              Submit proof <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <ol className="mt-4 flex gap-2 text-xs text-(--muted) flex-wrap">
            {["Finish your run with GPS on", "Screenshot activity summary", "Upload here · wait for approval"].map((s, i) => (
              <li key={i} className="flex items-center gap-1.5 rounded-lg bg-(--panel)/80 px-3 py-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-(--sage) text-[0.55rem] font-bold text-white">{i + 1}</span>{s}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {waitingReview.length > 0 ? (
        <div className="rounded-xl border border-(--line) bg-(--panel-soft) px-4 py-3 text-sm text-(--muted) flex items-center gap-2">
          <Clock className="h-4 w-4 text-(--sage)" />
          {waitingReview.length} proof{waitingReview.length === 1 ? "" : "s"} waiting for admin review.
        </div>
      ) : null}

      {proofMessage ? <div className="rounded-xl border border-(--sage)/30 bg-(--sage-soft) px-4 py-3 text-sm text-(--sage)">{proofMessage}</div> : null}

      {/* Rewards tracking */}
      {registrations.some((r) => r.proofStatus === "SUBMITTED" || r.proofStatus === "APPROVED") ? (
        <div>
          <h2 className="text-lg font-bold tracking-tight text-(--foreground)">Rewards</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {registrations.filter((r) => r.proofStatus === "SUBMITTED" || r.proofStatus === "APPROVED").map((reg) => (
              <div key={reg.id} className="rounded-xl border border-(--line) bg-(--panel) p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-(--foreground)">{reg.event.title}</p>
                    <p className="text-xs text-(--muted)">{reg.distance} · Bib {reg.bibNumber}</p>
                  </div>
                  <span className={badgeClass(reg.proofStatus) + " text-[0.6rem]"}>{labelStatus(reg.proofStatus)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {reg.certificate ? <span className={badgeClass(reg.certificate.status) + " text-[0.6rem]"}>Certificate {labelStatus(reg.certificate.status)}</span> : null}
                  {reg.medalDelivery ? <span className={badgeClass(reg.medalDelivery.status) + " text-[0.6rem]"}>Medal {labelStatus(reg.medalDelivery.status)}</span> : <span className="badge text-[0.6rem]">Medal pending</span>}
                </div>
                {reg.medalDelivery?.trackingNumber ? (
                  <div className="mt-3 rounded-lg bg-(--panel-soft) px-3 py-2 text-xs text-(--muted)">
                    {reg.medalDelivery.courier ? <p>Courier: <span className="font-medium text-(--foreground)">{reg.medalDelivery.courier}</span></p> : null}
                    <p className="mt-0.5">Tracking: <span className="font-mono font-medium text-(--foreground)">{reg.medalDelivery.trackingNumber}</span></p>
                    {reg.medalDelivery.trackingUrl ? <a className="mt-1 inline-flex text-(--sage) underline-offset-2 hover:underline" href={reg.medalDelivery.trackingUrl} rel="noopener noreferrer" target="_blank">Track package <ArrowUpRight className="ml-0.5 h-3 w-3" /></a> : null}
                  </div>
                ) : reg.medalDelivery ? (
                  <p className="mt-3 text-xs text-(--muted-soft)">Tracking details appear once dispatched.</p>
                ) : null}
                {reg.certificate && reg.certificate.status !== "QUEUED" ? (
                  <Link className="btn btn-secondary mt-3 h-8 w-full text-xs" href={`/certificates/${reg.certificate.certificateNumber}`}>View certificate <ArrowUpRight className="h-3 w-3" /></Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Registrations */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-(--foreground)">My registrations</h2>
        <p className="mt-1 text-sm text-(--muted)">Join → run → upload proof → get certificate + medal.</p>

        {registrations.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-(--line) bg-(--panel-soft)/50 p-8 text-center">
            <Medal className="mx-auto h-8 w-8 text-(--muted-soft)" />
            <p className="mt-3 text-sm font-medium text-(--foreground)">No registrations yet</p>
            <p className="mt-1 text-sm text-(--muted)">Join an event to start your journey.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {registrations.map((reg) => {
              const uploadOk = canUpload(reg);
              return (
                <div key={reg.id} id={`reg-${reg.id}`} className="rounded-xl border border-(--line) bg-(--panel) p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-base font-bold tracking-tight text-(--foreground) truncate">{reg.event.title}</p>
                        <span className={`shrink-0 ${badgeClass(reg.status)}`}>{labelStatus(reg.status)}</span>
                      </div>
                      <p className="mt-1 text-sm text-(--muted)">{reg.distance} · Bib {reg.bibNumber}</p>
                      <p className="text-xs text-(--muted-soft)">Joined {new Date(reg.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {/* Proof status */}
                    {reg.proofStatus !== "NOT_SUBMITTED" && (
                      <span className={badgeClass(reg.proofStatus)}>
                        Proof: {labelStatus(reg.proofStatus)}
                      </span>
                    )}
                    {/* Payment — only show if pending or failed */}
                    {reg.payment && (reg.payment.status === "CREATED" || reg.payment.status === "FAILED") && (
                      <span className={badgeClass(reg.payment.status)}>
                        {labelStatus(reg.payment.status)}{reg.payment.amountInPaise ? ` · ${formatMoney(reg.payment.amountInPaise)}` : ""}
                      </span>
                    )}
                    {/* Payment amount when paid */}
                    {reg.payment?.status === "PAID" && reg.payment.amountInPaise > 0 && (
                      <span className="badge badge-sage">{formatMoney(reg.payment.amountInPaise)} paid</span>
                    )}
                    {/* Certificate */}
                    {reg.certificate && reg.certificate.status !== "QUEUED" && (
                      <span className={badgeClass(reg.certificate.status)}>
                        Certificate: {labelStatus(reg.certificate.status)}
                      </span>
                    )}
                    {/* Medal */}
                    {reg.medalDelivery && reg.medalDelivery.status !== "PENDING" && (
                      <span className={badgeClass(reg.medalDelivery.status)}>
                        Medal: {labelStatus(reg.medalDelivery.status)}
                      </span>
                    )}
                  </div>

                  {reg.proofStatus === "REJECTED" && reg.proofUpload?.reviewerNote ? (
                    <p className="mt-3 rounded-lg border border-(--danger)/20 bg-(--danger)/8 px-3 py-2 text-xs text-(--danger)">Rejected: {reg.proofUpload.reviewerNote}. Upload a clearer GPS screenshot.</p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="btn btn-secondary h-9 px-3 text-xs" href={`/events/${reg.event.slug}`}>Event details <ArrowUpRight className="h-3 w-3" /></Link>
                    {(reg.status === "PENDING_PAYMENT" || reg.payment?.status === "CREATED") ? <Link className="btn btn-primary h-9 px-3 text-xs" href="/register">Complete payment</Link> : null}
                    {uploadOk ? (
                      <button className="btn btn-primary h-9 px-3 text-xs cursor-pointer" onClick={() => { setProofRegId(reg.id === proofRegId ? null : reg.id); setProofMessage(null); setProofError(null); }} type="button">
                        {proofRegId === reg.id ? "Close form" : "Upload GPS proof"}
                      </button>
                    ) : null}
                    {reg.proofStatus === "SUBMITTED" ? <span className="inline-flex h-9 items-center rounded-full border border-(--line) px-3 text-xs text-(--muted)"><Clock className="mr-1 h-3 w-3" />Under review</span> : null}
                    {reg.certificate && reg.certificate.status !== "QUEUED" ? <Link className="btn btn-secondary h-9 px-3 text-xs" href={`/certificates/${reg.certificate.certificateNumber}`}>Certificate <ArrowUpRight className="h-3 w-3" /></Link> : null}
                    {!isEligible(reg) && reg.status !== "PENDING_PAYMENT" ? <span className="inline-flex h-9 items-center text-xs text-(--muted-soft)">Confirm payment to unlock proof upload</span> : null}
                  </div>

                  {/* Proof upload form */}
                  {proofRegId === reg.id ? (
                    <form className="mt-5 space-y-4 rounded-xl border border-(--line) bg-(--panel-soft) p-4 sm:p-5" onSubmit={submitProof}>
                      <p className="text-sm font-bold text-(--foreground)">Submit GPS proof</p>
                      {proofError ? <p className="rounded-lg border border-(--danger)/20 bg-(--danger)/8 px-3 py-2 text-xs text-(--danger)">{proofError}</p> : null}
                      <label className="block">
                        <span className="field-label">Activity screenshot</span>
                        <input accept="image/*" className="input cursor-pointer py-2 file:mr-3 file:rounded-full file:border-0 file:bg-(--sage) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" disabled={proofBusy} onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)} type="file" />
                        {proofFileName ? <p className="mt-1.5 text-xs text-(--sage)">Ready: {proofFileName}</p> : null}
                      </label>
                      <label className="block">
                        <span className="field-label">Or image URL</span>
                        <input className="input" disabled={proofBusy || Boolean(proofFileName)} onChange={(e) => { setProofUrl(e.target.value); setProofFileName(null); }} placeholder="https://... (public image URL)" type="url" value={proofFileName ? "" : proofUrl.startsWith("data:") ? "" : proofUrl} />
                      </label>
                      {proofUrl && (proofUrl.startsWith("data:") || /\.(png|jpe?g|webp)/i.test(proofUrl)) ? (
                        <div className="overflow-hidden rounded-lg border border-(--line) bg-(--panel)">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="GPS proof preview" className="max-h-48 w-full object-contain" src={proofUrl} />
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
                          <input className="input" inputMode="decimal" onChange={(e) => setFinishMinutes(e.target.value)} placeholder="e.g. 52" value={finishMinutes} />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="btn btn-primary h-9 cursor-pointer" disabled={proofBusy} type="submit">{proofBusy ? "Submitting..." : "Submit proof"}</button>
                        <button className="btn btn-ghost h-9 cursor-pointer" onClick={() => { setProofRegId(null); setProofUrl(""); setProofFileName(null); setProofError(null); }} type="button">Cancel</button>
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
