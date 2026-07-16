"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";

type ProofRow = {
  id: string;
  bibNumber: string;
  distance: string;
  finishTimeSeconds: number | null;
  registeredAt: string;
  user: { name: string; email: string };
  event: { title: string };
  proofUpload: {
    activityImageUrl: string;
    sourceApp: string;
    submittedAt?: string;
  } | null;
};

export default function AdminProofsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ProofRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: ProofRow[]; meta: { total: number } }>(
        "/api/admin/proofs?status=SUBMITTED&pageSize=50",
        token,
      );
      setItems(json.data);
      setTotal(json.meta.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(id: string, approved: boolean) {
    setBusyId(id);
    try {
      const token = await getToken().catch(() => null);
      const note = approved
        ? undefined
        : window.prompt("Rejection reason (optional)") || undefined;
      await adminFetch(`/api/admin/proofs/${id}/review`, token, {
        method: "POST",
        body: JSON.stringify({ approved, reviewerNote: note }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Operations"
        title="Proof queue"
        description={`${total} submission${total === 1 ? "" : "s"} waiting for review.`}
        actions={
          <button className="btn btn-secondary" onClick={() => void load()} type="button">
            Refresh
          </button>
        }
      />

      {error ? <p className="admin-muted" style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      <div className="admin-stack admin-fill">
        {items.length === 0 ? (
          <div className="admin-panel admin-panel-pad is-fill">
            <AdminEmpty>Queue is empty.</AdminEmpty>
          </div>
        ) : (
          items.map((row) => (
            <article
              className="admin-panel admin-panel-pad grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(200px,240px)]"
              key={row.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight">{row.user.name}</h2>
                  <span className="badge">{row.bibNumber}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {row.event.title} · {row.distance} · {row.user.email}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-soft)]">
                  Registered {formatDateTime(row.registeredAt)}
                  {row.finishTimeSeconds != null
                    ? ` · claimed finish ${row.finishTimeSeconds}s`
                    : ""}
                  {row.proofUpload ? ` · ${row.proofUpload.sourceApp}` : ""}
                </p>
                {row.proofUpload ? (
                  <a
                    className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
                    href={row.proofUpload.activityImageUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open GPS screenshot
                  </a>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="btn btn-primary h-9"
                    disabled={busyId === row.id}
                    onClick={() => void review(row.id, true)}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-secondary h-9"
                    disabled={busyId === row.id}
                    onClick={() => void review(row.id, false)}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </div>
              {row.proofUpload ? (
                <a
                  className="block overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-soft)]"
                  href={row.proofUpload.activityImageUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="h-44 w-full object-cover"
                    src={row.proofUpload.activityImageUrl}
                  />
                </a>
              ) : (
                <div className="grid place-items-center rounded-xl border border-dashed border-[var(--line)] text-sm text-[var(--muted)]">
                  No image
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
