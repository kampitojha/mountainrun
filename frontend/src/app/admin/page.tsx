"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStat } from "./ui";

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
    return (
      <div>
        <AdminPageHeader title="Overview" description="Could not load live metrics." />
        <div className="admin-panel admin-panel-pad">
          <p className="admin-muted" style={{ color: "var(--admin-danger)", margin: 0 }}>
            {error}
          </p>
          <button className="btn btn-secondary" onClick={() => void load()} style={{ marginTop: "0.85rem" }} type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <AdminPageHeader title="Overview" description="Loading live metrics from the API…" />
        <div className="admin-stat-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="admin-stat" key={i}>
              <div className="label">—</div>
              <div className="value" style={{ opacity: 0.25 }}>
                …
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Revenue", value: formatInrFromPaise(data.stats.revenueInPaise), hint: "Paid totals" },
    { label: "Registrations", value: String(data.stats.registrations), hint: "All time" },
    { label: "Confirmed", value: String(data.stats.confirmedRegs), hint: "Ready to run" },
    { label: "Pending pay", value: String(data.stats.pendingPayment), hint: "Needs checkout" },
    { label: "Proof queue", value: String(data.stats.pendingProofs), hint: "Awaiting review" },
    { label: "Open events", value: String(data.stats.openEvents), hint: "Accepting entries" },
    { label: "Users", value: String(data.stats.users), hint: "Accounts" },
    { label: "Medals out", value: String(data.stats.medalsPending), hint: "Pending dispatch" },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Workspace"
        title="Overview"
        description="Live snapshot of events, money, proofs, and fulfillment."
        actions={
          <>
            <Link className="btn btn-secondary" href="/admin/proofs">
              Review proofs
            </Link>
            <Link className="btn btn-primary" href="/admin/events">
              Manage events
            </Link>
          </>
        }
      />

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <AdminStat hint={stat.hint} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="admin-split">
        <AdminPanel
          fill
          action={
            <Link className="admin-link" href="/admin/registrations">
              View all
            </Link>
          }
          title="Recent registrations"
          subtitle="Latest runners who joined an event"
        >
          {data.recentRegistrations.length === 0 ? (
            <AdminEmpty>No registrations yet.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data.recentRegistrations.map((row) => (
                <Link className="admin-list-item" href={`/admin/registrations/${row.id}`} key={row.id}>
                  <div>
                    <div className="title">{row.user.name}</div>
                    <div className="sub">
                      {row.event.title} · {row.distance} · {row.bibNumber}
                    </div>
                  </div>
                  <div className="right">
                    <span className="badge">{row.status}</span>
                    <div className="sub" style={{ marginTop: "0.35rem" }}>
                      {formatDateTime(row.registeredAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          fill
          action={
            <Link className="admin-link" href="/admin/payments">
              View all
            </Link>
          }
          title="Recent payments"
          subtitle="Latest successful and pending charges"
        >
          {data.recentPayments.length === 0 ? (
            <AdminEmpty>No payments yet.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data.recentPayments.map((row) => (
                <div className="admin-list-item" key={row.id}>
                  <div>
                    <div className="title">{row.registration.user.name}</div>
                    <div className="sub">
                      {row.registration.event.title} · {row.registration.bibNumber}
                    </div>
                  </div>
                  <div className="right">
                    <div className="title">{formatInrFromPaise(row.amountInPaise)}</div>
                    <div style={{ marginTop: "0.35rem" }}>
                      <span className="badge">{row.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
