"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";

type Registration = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  finishTimeSeconds?: number | null;
  registeredAt: string;
  event: {
    title: string;
    slug: string;
  };
  payment: {
    status: string;
    amountInPaise: number;
  } | null;
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

function statusBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "badge-sage",
    PAID: "badge-sage",
    APPROVED: "badge-sage",
    PENDING_PAYMENT: "badge",
    CREATED: "badge",
    SUBMITTED: "badge-warn",
    REJECTED: "badge-danger",
    NOT_SUBMITTED: "badge",
    GENERATED: "badge-sage",
    SENT: "badge-sage",
    DISPATCHED: "badge-sage",
    DELIVERED: "badge-sage",
    QUEUED: "badge",
  };
  return map[status] ?? "badge";
}

function labelStatus(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

function isRegistrationEligible(reg: Registration) {
  return (
    reg.status === "CONFIRMED" ||
    reg.status === "COMPLETED" ||
    reg.payment?.status === "PAID"
  );
}

function canUploadProof(reg: Registration) {
  return (
    isRegistrationEligible(reg) &&
    (reg.proofStatus === "NOT_SUBMITTED" || reg.proofStatus === "REJECTED")
  );
}

function uniqueRegistrations(rows: Registration[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) {
      return false;
    }
    seen.add(row.id);
    return true;
  });
}

/** Compress image client-side for upload without Cloudinary oversized payloads. */
async function fileToUploadPayload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG, or WebP).");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB. Compress or crop the screenshot.");
  }

  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process image in this browser.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // JPEG keeps screenshots small enough for API + email previews.
  return canvas.toDataURL("image/jpeg", 0.82);
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
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    const requestId = loadSequence.current + 1;
    loadSequence.current = requestId;

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Could not get session token. Sign in again.");
      }

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

      const response = await fetch(getApiUrl("/api/users/me"), {
        headers: authHeaders(token),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Could not load dashboard"));
      }

      const json = await response.json();
      if (loadSequence.current !== requestId) {
        return;
      }
      setDbUser(json.data as DbUser);
    } catch (err) {
      if (loadSequence.current !== requestId) {
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      if (loadSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [getToken, isSignedIn, user]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isLoaded, load]);

  const registrations = useMemo(
    () => uniqueRegistrations(dbUser?.registrations ?? []),
    [dbUser?.registrations],
  );
  const isAdmin =
    dbUser?.role === "ADMIN" || dbUser?.role === "SUPER_ADMIN";
  const needsProof = useMemo(
    () => registrations.filter((r) => canUploadProof(r)),
    [registrations],
  );
  const waitingReview = useMemo(
    () => registrations.filter((r) => r.proofStatus === "SUBMITTED"),
    [registrations],
  );
  /** Medal / prize tracking only after proof is in (submitted or approved). */
  const trackableRewards = useMemo(
    () =>
      registrations.filter(
        (r) =>
          (r.proofStatus === "SUBMITTED" || r.proofStatus === "APPROVED") &&
          (r.medalDelivery ||
            (r.certificate && r.certificate.status !== "QUEUED")),
      ),
    [registrations],
  );

  async function onPickFile(file: File | null) {
    setProofError(null);
    setProofFileName(null);
    setProofUrl("");
    if (!file) {
      return;
    }
    try {
      setProofBusy(true);
      const dataUrl = await fileToUploadPayload(file);
      setProofUrl(dataUrl);
      setProofFileName(file.name);
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Could not read image");
    } finally {
      setProofBusy(false);
    }
  }

  async function submitProof(event: FormEvent) {
    event.preventDefault();
    if (!proofRegId) {
      return;
    }

    setProofBusy(true);
    setProofMessage(null);
    setProofError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Sign in again to submit proof.");
      }

      let activityImageUrl = proofUrl.trim();
      if (!activityImageUrl) {
        throw new Error("Upload a screenshot or paste an image URL.");
      }

      // Upload via API (Cloudinary when configured; data URL / https fallback).
      if (activityImageUrl.startsWith("data:") || activityImageUrl.startsWith("https://")) {
        const uploadRes = await fetch(getApiUrl("/api/uploads/image"), {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({ file: activityImageUrl, folder: "mountainrun/proofs" }),
        });
        if (!uploadRes.ok) {
          // If upload endpoint fails for https URL, still try direct URL for proof.
          if (!activityImageUrl.startsWith("https://")) {
            throw new Error(await readApiError(uploadRes, "Image upload failed"));
          }
        } else {
          const uploadJson = await uploadRes.json();
          activityImageUrl = uploadJson.data.url as string;
        }
      }

      const minutes = Number(finishMinutes);
      const finishTimeSeconds =
        Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : undefined;

      const response = await fetch(getApiUrl(`/api/registrations/${proofRegId}/proof`), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          activityImageUrl,
          sourceApp: sourceApp.trim() || "Other",
          finishTimeSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Proof submit failed"));
      }

      setProofMessage(
        "Proof submitted successfully. You’ll get a certificate email after admin approval.",
      );
      setProofRegId(null);
      setProofUrl("");
      setProofFileName(null);
      setFinishMinutes("");
      await load();
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Proof submit failed");
    } finally {
      setProofBusy(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-[var(--muted)]">Loading your dashboard…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="card p-8 text-center sm:p-10">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in required</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
          Your dashboard shows registrations, payments, and proof status. Sign in to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" href="/sign-in">
            Sign in
          </Link>
          <Link className="btn btn-secondary" href="/sign-up">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const displayName = dbUser?.name || user?.fullName || user?.firstName || "Runner";
  const email = dbUser?.email || user?.primaryEmailAddress?.emailAddress || "—";
  const paidCount = registrations.filter((r) => isRegistrationEligible(r)).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="min-w-0">
          <p className="eyebrow">{isAdmin ? "Admin account" : "Your account"}</p>
          <h1 className="display mt-3">Hi, {displayName.split(" ")[0]}</h1>
          <p className="lede mt-3 max-w-xl">
            {isAdmin
              ? "You have ops access. Use the admin console for proofs, content, and fulfilment — or manage your own races below."
              : "Track races, upload GPS proof after you finish, and download certificates here."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {isAdmin ? (
            <Link className="btn btn-primary w-full sm:w-auto" href="/admin">
              Open admin console
            </Link>
          ) : null}
          <Link
            className={`btn w-full shrink-0 sm:w-auto ${isAdmin ? "btn-secondary" : "btn-primary"}`}
            href="/events"
          >
            Join an event
          </Link>
        </div>
      </div>

      {isAdmin ? (
        <div className="rounded-2xl border border-(--sage)/30 bg-(--sage-soft)/50 p-5 sm:p-6">
          <p className="text-sm font-semibold tracking-tight text-(--foreground)">
            Operations console
          </p>
          <p className="mt-1 text-sm text-(--muted)">
            Review proofs, send certificates, manage homepage gallery/reviews, and track medal
            dispatch — separate from your runner dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn btn-secondary h-9 px-3 text-xs flex-1 sm:flex-none" href="/admin">
              Overview
            </Link>
            <Link className="btn btn-secondary h-9 px-3 text-xs flex-1 sm:flex-none" href="/admin/proofs">
              Proof queue
            </Link>
            <Link className="btn btn-secondary h-9 px-3 text-xs flex-1 sm:flex-none" href="/admin/content">
              Homepage &amp; gallery
            </Link>
            <Link className="btn btn-secondary h-9 px-3 text-xs flex-1 sm:flex-none" href="/admin/medals">
              Medals
            </Link>
            <Link className="btn btn-secondary h-9 px-3 text-xs flex-1 sm:flex-none" href="/admin/certificates">
              Certificates
            </Link>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}{" "}
          <button className="underline" onClick={() => void load()} type="button">
            Retry
          </button>
        </div>
      ) : null}

      {proofMessage ? (
        <div className="rounded-xl border border-[var(--sage)]/30 bg-[var(--sage-soft)] px-4 py-3 text-sm text-[var(--sage)]">
          {proofMessage}
        </div>
      ) : null}

      {/* Proof action strip — always visible when action needed */}
      {needsProof.length > 0 ? (
        <div className="card border-[var(--sage)]/25 bg-[var(--sage-soft)]/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
                Upload GPS proof ({needsProof.length} ready)
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                After your run, upload a screenshot from Strava / Garmin / NRC. Admin review unlocks
                leaderboard + certificate email.
              </p>
            </div>
            <button
              className="btn btn-primary shrink-0"
              onClick={() => {
                setProofRegId(needsProof[0].id);
                setProofMessage(null);
                setProofError(null);
                document.getElementById(`reg-${needsProof[0].id}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              type="button"
            >
              Submit proof now
            </button>
          </div>
          <ol className="mt-4 grid gap-2 text-xs text-[var(--muted)] grid-cols-1 sm:grid-cols-3">
            <li className="rounded-lg bg-[var(--panel)]/80 px-3 py-2">1. Finish your run with GPS on</li>
            <li className="rounded-lg bg-[var(--panel)]/80 px-3 py-2">2. Screenshot activity summary</li>
            <li className="rounded-lg bg-[var(--panel)]/80 px-3 py-2">3. Upload here · wait for approval</li>
          </ol>
        </div>
      ) : null}

      {waitingReview.length > 0 ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--muted)]">
          {waitingReview.length} proof{waitingReview.length === 1 ? "" : "s"} waiting for admin
          review.
        </div>
      ) : null}

      {/* Rewards tracking — only after proof submit/approve */}
      {trackableRewards.length > 0 ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Medals & rewards tracking
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Available after you submit GPS proof. Status updates when ops reviews and ships.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {trackableRewards.map((reg) => (
              <article
                key={`reward-${reg.id}`}
                className="card flex flex-col gap-3 p-4 sm:p-5"
              >
                <div>
                  <p className="text-sm font-semibold tracking-tight">{reg.event.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {reg.distance} · Bib {reg.bibNumber}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={statusBadge(reg.proofStatus)}>
                    proof: {labelStatus(reg.proofStatus)}
                  </span>
                  {reg.certificate ? (
                    <span className={statusBadge(reg.certificate.status)}>
                      cert: {labelStatus(reg.certificate.status)}
                    </span>
                  ) : null}
                  {reg.medalDelivery ? (
                    <span className={statusBadge(reg.medalDelivery.status)}>
                      medal: {labelStatus(reg.medalDelivery.status)}
                    </span>
                  ) : (
                    <span className="badge">medal: not yet</span>
                  )}
                </div>
                {reg.medalDelivery ? (
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2.5 text-xs text-[var(--muted)]">
                    {reg.medalDelivery.courier ? (
                      <p>
                        Courier:{" "}
                        <span className="font-medium text-[var(--foreground)]">
                          {reg.medalDelivery.courier}
                        </span>
                      </p>
                    ) : null}
                    {reg.medalDelivery.trackingNumber ? (
                      <p className="mt-1">
                        Tracking #:{" "}
                        <span className="font-mono font-medium text-[var(--foreground)]">
                          {reg.medalDelivery.trackingNumber}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1">
                        Tracking number appears here once your medal is dispatched.
                      </p>
                    )}
                    {reg.medalDelivery.trackingUrl ? (
                      <a
                        className="mt-2 inline-flex font-medium text-[var(--sage)] underline-offset-2 hover:underline"
                        href={reg.medalDelivery.trackingUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Open tracking link
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {reg.certificate && reg.certificate.status !== "QUEUED" ? (
                  <Link
                    className="btn btn-secondary h-9 w-full text-xs sm:w-auto"
                    href={`/certificates/${reg.certificate.certificateNumber}`}
                  >
                    View certificate
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : registrations.some((r) => isRegistrationEligible(r)) ? (
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-soft)]/50 px-4 py-4 text-sm text-[var(--muted)]">
          Medal & prize tracking unlocks after you upload GPS proof for a paid race.
        </div>
      ) : null}

      <div className="card flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${user.firstName || 'User'} ${user.lastName || ''} profile picture`}
              className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
              src={user.imageUrl}
            />
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--panel-soft)] text-sm font-semibold sm:h-14 sm:w-14">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-[200px] sm:gap-3">
          <div className="rounded-xl bg-[var(--panel-soft)] px-3 py-3 text-center sm:px-4">
            <p className="text-xl font-semibold tracking-tight sm:text-2xl">
              {registrations.length}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Registrations</p>
          </div>
          <div className="rounded-xl bg-[var(--panel-soft)] px-3 py-3 text-center sm:px-4">
            <p className="text-xl font-semibold tracking-tight sm:text-2xl">{paidCount}</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Paid / confirmed</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="heading">My registrations</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Pay → run → upload GPS proof → get certificate after approval.
            </p>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="card mt-6 p-8 text-center">
            <p className="text-base font-medium">No registrations yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Join an event to see bib number, payment, and proof status here.
            </p>
            <Link className="btn btn-primary mt-6" href="/events">
              Browse events
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {registrations.map((reg) => {
              const eligible = isRegistrationEligible(reg);
              const uploadOk = canUploadProof(reg);

              return (
                <article className="card p-4 sm:p-5" id={`reg-${reg.id}`} key={reg.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold tracking-tight truncate">{reg.event.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {reg.distance} · Bib {reg.bibNumber}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-soft)]">
                        Registered {new Date(reg.registeredAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={statusBadge(reg.status)}>{labelStatus(reg.status)}</span>
                      <span className={statusBadge(reg.proofStatus)}>
                        proof: {labelStatus(reg.proofStatus)}
                      </span>
                      {reg.payment ? (
                        <span className={statusBadge(reg.payment.status)}>
                          {labelStatus(reg.payment.status)}
                          {reg.payment.amountInPaise
                            ? ` · ${formatMoney(reg.payment.amountInPaise)}`
                            : ""}
                        </span>
                      ) : (
                        <span className="badge">no payment yet</span>
                      )}
                      {reg.certificate ? (
                        <span className={statusBadge(reg.certificate.status)}>
                          cert: {labelStatus(reg.certificate.status)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {reg.proofStatus === "REJECTED" && reg.proofUpload?.reviewerNote ? (
                    <p className="mt-3 rounded-lg border border-red-200/60 bg-red-50/80 px-3 py-2 text-xs text-[var(--danger)]">
                      Rejected: {reg.proofUpload.reviewerNote}. Re-upload a clearer GPS screenshot.
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="btn btn-secondary h-9 px-3 text-xs"
                      href={`/events/${reg.event.slug}`}
                    >
                      Event details
                    </Link>
                    {reg.status === "PENDING_PAYMENT" || reg.payment?.status === "CREATED" ? (
                      <Link className="btn btn-primary h-9 px-3 text-xs" href="/register">
                        Complete payment
                      </Link>
                    ) : null}
                    {uploadOk ? (
                      <button
                        className="btn btn-primary h-9 px-3 text-xs"
                        onClick={() => {
                          setProofRegId(reg.id === proofRegId ? null : reg.id);
                          setProofMessage(null);
                          setProofError(null);
                        }}
                        type="button"
                      >
                        {proofRegId === reg.id ? "Close proof form" : "Upload GPS proof"}
                      </button>
                    ) : null}
                    {reg.proofStatus === "SUBMITTED" ? (
                      <span className="inline-flex h-9 items-center rounded-full border border-[var(--line)] px-3 text-xs text-[var(--muted)]">
                        Under review
                      </span>
                    ) : null}
                    {reg.certificate && reg.certificate.status !== "QUEUED" ? (
                      <Link
                        className="btn btn-secondary h-9 px-3 text-xs"
                        href={`/certificates/${reg.certificate.certificateNumber}`}
                      >
                        View certificate
                      </Link>
                    ) : null}
                    {!eligible && reg.status !== "PENDING_PAYMENT" ? (
                      <span className="inline-flex h-9 items-center text-xs text-[var(--muted-soft)]">
                        Confirm payment to unlock proof upload
                      </span>
                    ) : null}
                  </div>

                  {proofRegId === reg.id ? (
                    <form
                      className="mt-5 space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-4 sm:p-5"
                      onSubmit={submitProof}
                    >
                      <div>
                        <p className="text-sm font-semibold">Submit GPS proof</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          Upload a clear screenshot of your finished activity (map + distance + time
                          visible). Or paste a public image link.
                        </p>
                      </div>

                      {proofError ? (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-[var(--danger)]">
                          {proofError}
                        </p>
                      ) : null}

                      <label className="block">
                        <span className="field-label">Activity screenshot</span>
                        <input
                          accept="image/*"
                          className="input cursor-pointer py-2 file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--on-accent)]"
                          disabled={proofBusy}
                          onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                          type="file"
                        />
                        {proofFileName ? (
                          <p className="mt-1.5 text-xs text-[var(--sage)]">
                            Ready: {proofFileName}
                          </p>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="field-label">Or image URL (optional)</span>
                        <input
                          className="input"
                          disabled={proofBusy || Boolean(proofFileName)}
                          onChange={(e) => {
                            setProofUrl(e.target.value);
                            setProofFileName(null);
                          }}
                          placeholder="https://… (public image)"
                          type="url"
                          value={proofFileName ? "" : proofUrl.startsWith("data:") ? "" : proofUrl}
                        />
                      </label>

                      {proofUrl.startsWith("data:") ||
                      (proofUrl.startsWith("https://") && /\.(png|jpe?g|webp)/i.test(proofUrl)) ? (
                        <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt="GPS running proof screenshot showing completed distance and route"
                            className="max-h-48 w-full object-contain"
                            src={proofUrl}
                          />
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-sm">
                          <span className="field-label">Source app</span>
                          <select
                            className="input"
                            onChange={(e) => setSourceApp(e.target.value)}
                            required
                            value={sourceApp}
                          >
                            {SOURCE_APPS.map((app) => (
                              <option key={app} value={app}>
                                {app}
                              </option>
                            ))}
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
                        <button className="btn btn-primary h-9" disabled={proofBusy} type="submit">
                          {proofBusy ? "Submitting…" : "Submit proof for review"}
                        </button>
                        <button
                          className="btn btn-ghost h-9"
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
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
