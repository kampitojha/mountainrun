"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";
import { CheckCircle, XCircle, X, AlertCircle } from "lucide-react";

/* ── Toast system ───────────────────────────────────────── */
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] max-w-sm animate-in slide-in-from-right-4 duration-200 ${
            t.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
              : t.type === "error"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/60 dark:text-red-300"
              : "border-[var(--admin-line)] bg-[var(--admin-surface)] text-[var(--admin-ink-soft)]"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : t.type === "error" ? (
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  function toast(type: Toast["type"], message: string, duration = 4000) {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), duration);
  }

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, dismiss, toast };
}

/* ── Rejection modal ────────────────────────────────────── */
function RejectModal({
  open,
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--admin-line)] bg-[var(--admin-surface)] p-6 shadow-2xl">
        <h3 className="text-base font-bold text-[var(--admin-ink)]">Reject proof</h3>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Optionally add a note to help the runner fix their submission.
        </p>
        <textarea
          autoFocus
          className="input mt-4 min-h-[5rem] w-full py-2 text-sm resize-none"
          placeholder="e.g. Distance not visible in screenshot…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn btn-secondary h-9"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={busy}
            className="btn h-9 bg-red-600 text-white hover:bg-red-500"
          >
            {busy ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Types ──────────────────────────────────────────────── */
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

/* ── Page ───────────────────────────────────────────────── */
export default function AdminProofsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ProofRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, dismiss, toast } = useToast();

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectBusy, setRejectBusy] = useState(false);

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

  async function approve(id: string) {
    setBusyId(id);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/proofs/${id}/review`, token, {
        method: "POST",
        body: JSON.stringify({ approved: true }),
      });
      toast("success", "Proof approved. Certificate queued — send it from the Certificates page.");
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Approval failed");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string, note: string) {
    setRejectBusy(true);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/proofs/${id}/review`, token, {
        method: "POST",
        body: JSON.stringify({ approved: false, reviewerNote: note || undefined }),
      });
      toast("info", note ? `Proof rejected: "${note}"` : "Proof rejected.");
      setRejectTarget(null);
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setRejectBusy(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <RejectModal
        open={rejectTarget !== null}
        onConfirm={(note) => rejectTarget && void reject(rejectTarget, note)}
        onCancel={() => setRejectTarget(null)}
        busy={rejectBusy}
      />

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

        {error ? (
          <p className="admin-muted" style={{ color: "var(--admin-danger)" }}>{error}</p>
        ) : null}

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
                      ? ` · claimed ${row.finishTimeSeconds}s`
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
                      Open GPS screenshot ↗
                    </a>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="btn btn-primary h-9 px-4"
                      disabled={busyId === row.id}
                      onClick={() => void approve(row.id)}
                      type="button"
                    >
                      {busyId === row.id ? "Approving…" : "✓ Approve"}
                    </button>
                    <button
                      className="btn btn-secondary h-9 px-4"
                      disabled={busyId === row.id || rejectBusy}
                      onClick={() => setRejectTarget(row.id)}
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
                      alt="GPS proof screenshot"
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
    </>
  );
}
