"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
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
  } | null;
  certificate?: {
    certificateNumber: string;
    status: string;
  } | null;
  medalDelivery?: {
    status: string;
    trackingNumber: string | null;
  } | null;
};

type DbUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  clerkId: string | null;
  registrations: Registration[];
};

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
    SUBMITTED: "badge",
    REJECTED: "badge",
    NOT_SUBMITTED: "badge",
    GENERATED: "badge-sage",
    SENT: "badge-sage",
    DISPATCHED: "badge-sage",
    DELIVERED: "badge-sage",
  };
  return map[status] ?? "badge";
}

function labelStatus(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

export function DashboardClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofRegId, setProofRegId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [sourceApp, setSourceApp] = useState("Strava");
  const [finishMinutes, setFinishMinutes] = useState("");
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [proofBusy, setProofBusy] = useState(false);

  const load = useCallback(async () => {
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
      setDbUser(json.data as DbUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
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

  async function submitProof(event: FormEvent) {
    event.preventDefault();
    if (!proofRegId) {
      return;
    }

    setProofBusy(true);
    setProofMessage(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Sign in again to submit proof.");
      }

      const minutes = Number(finishMinutes);
      const finishTimeSeconds =
        Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : undefined;

      const response = await fetch(getApiUrl(`/api/registrations/${proofRegId}/proof`), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          activityImageUrl: proofUrl.trim(),
          sourceApp: sourceApp.trim() || "Other",
          finishTimeSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Proof submit failed"));
      }

      setProofMessage("Proof submitted. Waiting for admin review.");
      setProofRegId(null);
      setProofUrl("");
      setFinishMinutes("");
      await load();
    } catch (err) {
      setProofMessage(err instanceof Error ? err.message : "Proof submit failed");
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
  const registrations = dbUser?.registrations ?? [];
  const paidCount = registrations.filter(
    (r) => r.payment?.status === "PAID" || r.status === "CONFIRMED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="min-w-0">
          <p className="eyebrow">Your account</p>
          <h1 className="display mt-3">Hi, {displayName.split(" ")[0]}</h1>
          <p className="lede mt-3 max-w-xl">
            Track every race, payment, proof, certificate, and medal in one place.
          </p>
        </div>
        <Link className="btn btn-primary w-full shrink-0 sm:w-auto" href="/register">
          Join an event
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}{" "}
          <button className="underline" onClick={() => void load()} type="button">
            Retry
          </button>
        </div>
      ) : null}

      {proofMessage ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--muted)]">
          {proofMessage}
        </div>
      ) : null}

      <div className="card flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
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
            {dbUser?.clerkId ? (
              <p className="mt-1 font-mono text-[0.65rem] text-[var(--muted-soft)]">
                Linked to Clerk
              </p>
            ) : null}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/register", title: "Register", text: "Pick event, distance, pay with UPI" },
          { href: "/events", title: "Browse events", text: "See open races and details" },
          { href: "/leaderboard", title: "Leaderboard", text: "View verified finish times" },
        ].map((item) => (
          <Link className="card card-hover block p-5" href={item.href} key={item.href}>
            <p className="font-semibold tracking-tight">{item.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.text}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="heading">My registrations</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Payments, proof upload, certificates, and medals for every event you joined.
            </p>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="card mt-6 p-8 text-center">
            <p className="text-base font-medium">No registrations yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Join an event to see bib number, payment, and proof status here.
            </p>
            <Link className="btn btn-primary mt-6" href="/register">
              Register for an event
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {registrations.map((reg) => {
              const canUploadProof =
                (reg.status === "CONFIRMED" || reg.payment?.status === "PAID") &&
                (reg.proofStatus === "NOT_SUBMITTED" || reg.proofStatus === "REJECTED");

              return (
                <article className="card p-5" key={reg.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold tracking-tight">{reg.event.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {reg.distance} · Bib {reg.bibNumber}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-soft)]">
                        Registered {new Date(reg.registeredAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                        <Link
                          className="badge badge-sage"
                          href={`/certificates/${reg.certificate.certificateNumber}`}
                        >
                          cert: {labelStatus(reg.certificate.status)}
                        </Link>
                      ) : null}
                      {reg.medalDelivery ? (
                        <span className={statusBadge(reg.medalDelivery.status)}>
                          medal: {labelStatus(reg.medalDelivery.status)}
                        </span>
                      ) : null}
                    </div>
                  </div>

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
                    {canUploadProof ? (
                      <button
                        className="btn btn-primary h-9 px-3 text-xs"
                        onClick={() => {
                          setProofRegId(reg.id);
                          setProofMessage(null);
                        }}
                        type="button"
                      >
                        Upload GPS proof
                      </button>
                    ) : null}
                    {reg.certificate ? (
                      <Link
                        className="btn btn-secondary h-9 px-3 text-xs"
                        href={`/certificates/${reg.certificate.certificateNumber}`}
                      >
                        View certificate
                      </Link>
                    ) : null}
                  </div>

                  {proofRegId === reg.id ? (
                    <form className="mt-5 space-y-3 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-4" onSubmit={submitProof}>
                      <p className="text-sm font-medium">Submit GPS proof</p>
                      <p className="text-xs text-[var(--muted)]">
                        Paste a public image URL of your activity screenshot (Strava, Garmin, Nike
                        Run Club, etc.). Admin will review it for the leaderboard.
                      </p>
                      <label className="block text-sm">
                        <span className="field-label">Activity image URL</span>
                        <input
                          className="input"
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="https://..."
                          required
                          type="url"
                          value={proofUrl}
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-sm">
                          <span className="field-label">Source app</span>
                          <input
                            className="input"
                            onChange={(e) => setSourceApp(e.target.value)}
                            required
                            value={sourceApp}
                          />
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
                          {proofBusy ? "Submitting…" : "Submit proof"}
                        </button>
                        <button
                          className="btn btn-ghost h-9"
                          onClick={() => setProofRegId(null)}
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
