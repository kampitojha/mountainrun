"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../lib/admin-api";

type Overview = {
  stats: {
    events: number;
    openEvents: number;
    registrations: number;
    confirmedRegs: number;
    pendingPayment: number;
    revenueInPaise: number;
    pendingProofs: number;
    certificates: number;
    medalsPending: number;
    users: number;
  };
  recentRegistrations: Array<{
    id: string;
    bibNumber: string;
    distance: string;
    status: string;
    registeredAt: string;
    user: { name: string; email: string };
    event: { title: string };
    payment?: { status: string; amountInPaise: number } | null;
  }>;
  recentPayments: Array<{
    id: string;
    status: string;
    amountInPaise: number;
    createdAt: string;
    registration: {
      bibNumber: string;
      user: { name: string };
      event: { title: string };
    };
  }>;
};

export default function AdminOverviewPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: Overview }>("/api/admin/overview", token);
      setData(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-[var(--muted)]">Loading overview…</p>;
  }

  const cards = [
    ["Revenue", formatInrFromPaise(data.stats.revenueInPaise)],
    ["Registrations", String(data.stats.registrations)],
    ["Confirmed", String(data.stats.confirmedRegs)],
    ["Pending pay", String(data.stats.pendingPayment)],
    ["Proof queue", String(data.stats.pendingProofs)],
    ["Open events", String(data.stats.openEvents)],
    ["Users", String(data.stats.users)],
    ["Medals out", String(data.stats.medalsPending)],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="heading mt-2">Overview</h1>
          <p className="lede mt-2">Live numbers from the database.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-secondary h-9 px-3" href="/admin/proofs">
            Review proofs
          </Link>
          <Link className="btn btn-primary h-9 px-3" href="/admin/events">
            Manage events
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div className="card p-4" key={label}>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold tracking-tight">Recent registrations</h2>
            <Link className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" href="/admin/registrations">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentRegistrations.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No registrations yet.</p>
            ) : (
              data.recentRegistrations.map((row) => (
                <Link
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3 transition hover:bg-[var(--panel-soft)]"
                  href={`/admin/registrations/${row.id}`}
                  key={row.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.user.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {row.event.title} · {row.distance} · {row.bibNumber}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="badge">{row.status}</span>
                    <p className="mt-1 text-[0.65rem] text-[var(--muted-soft)]">
                      {formatDateTime(row.registeredAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold tracking-tight">Recent payments</h2>
            <Link className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" href="/admin/payments">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentPayments.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No payments yet.</p>
            ) : (
              data.recentPayments.map((row) => (
                <div
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3"
                  key={row.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {row.registration.user.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {row.registration.event.title} · {row.registration.bibNumber}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      {formatInrFromPaise(row.amountInPaise)}
                    </p>
                    <span className="badge mt-1">{row.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
