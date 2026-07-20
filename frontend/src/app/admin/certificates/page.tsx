"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Mail,
  FileCheck,
  Send,
  ExternalLink,
  RefreshCw,
  Info,
} from "lucide-react";

/* ── Toast ─────────────────────────────────────────────── */
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] max-w-sm ${
            t.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
            : t.type === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/60 dark:text-red-300"
            : "border-[var(--admin-line)] bg-[var(--admin-surface)] text-[var(--admin-ink-soft)]"
          }`}>
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            : t.type === "error" ? <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            : <AlertCircle className="h-4 w-4" />}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 opacity-50 hover:opacity-100 cursor-pointer">
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
  function toast(type: Toast["type"], message: string, duration = 4500) {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }
  function dismiss(id: number) { setToasts((prev) => prev.filter((t) => t.id !== id)); }
  return { toasts, dismiss, toast };
}

/* ── Types ─────────────────────────────────────────────── */
type CertRow = {
  id: string;
  certificateNumber: string;
  status: string;
  pdfUrl: string | null;
  issuedAt?: string | null;
  registration: {
    bibNumber: string;
    user: { name: string; email: string };
    event: { title: string };
  };
};

const STATUS_INFO: Record<string, { label: string; color: string; hint: string }> = {
  QUEUED:    { label: "Pending",   color: "badge",           hint: "Runner hasn't received anything yet" },
  GENERATED: { label: "Ready",     color: "badge badge-sage", hint: "Verify link ready — email not sent yet" },
  SENT:      { label: "Emailed",   color: "badge badge-solid", hint: "Runner received the certificate email" },
};

/* ── Page ───────────────────────────────────────────────── */
export default function AdminCertificatesPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<CertRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const { toasts, dismiss, toast } = useToast();

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const json = await adminFetch<{ data: CertRow[] }>(`/api/admin/certificates?${params}`, token);
      setItems(json.data);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to load certificates");
    }
  }, [getToken, statusFilter]); // eslint-disable-line

  useEffect(() => { void load(); }, [load]);

  /* Per-row actions */
  async function runAction(id: string, path: string, successMsg: string) {
    setBusyId(id);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: CertRow; meta?: { email?: { sent?: boolean; error?: string } } }>(
        path, token, { method: "POST" });
      const emailMeta = json.meta?.email;
      if (emailMeta?.sent === false) {
        toast("error", `${successMsg} — but email failed: ${emailMeta.error ?? "check RESEND_API_KEY in Railway"}`);
      } else {
        toast("success", successMsg);
      }
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  /* Bulk actions */
  async function runBulk(path: string, successLabel: string) {
    setBulkBusy(true);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ meta?: { count?: number; sent?: number } }>(path, token, { method: "POST" });
      const count = json.meta?.count ?? 0;
      const sent = json.meta?.sent;
      if (count === 0) {
        toast("info", `${successLabel}: nothing to process.`);
      } else if (sent != null) {
        toast("success", `${successLabel}: ${sent} of ${count} emails sent.`);
      } else {
        toast("success", `${successLabel}: ${count} certificate${count === 1 ? "" : "s"} processed.`);
      }
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  }

  const queued    = items.filter((i) => i.status === "QUEUED").length;
  const generated = items.filter((i) => i.status === "GENERATED").length;
  const sent      = items.filter((i) => i.status === "SENT").length;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="admin-stack">
        <AdminPageHeader
          kicker="Fulfillment"
          title="Certificates"
          description="Send finisher certificates to runners. Certificates are created automatically when you approve a GPS proof."
        />

        {/* ── How it works banner ── */}
        <div className="rounded-xl border border-[var(--admin-teal-dim,rgba(20,184,166,0.15))] bg-[var(--admin-teal-dim,rgba(20,184,166,0.08))] px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-[var(--admin-teal)]" />
            <div className="text-xs text-[var(--admin-ink-soft)] space-y-0.5">
              <p><strong className="text-[var(--admin-ink)]">How certificates work:</strong></p>
              <p><strong>Pending</strong> → Proof approved, certificate number assigned, runner has nothing yet.</p>
              <p><strong>Ready</strong> → Verify link generated, certificate is viewable online, but email not sent.</p>
              <p><strong>Emailed</strong> → Runner received the certificate in their inbox. ✓ Done.</p>
              <p className="pt-1 text-[var(--admin-muted)]">Tip: Use <em>"Send email"</em> per row, or <em>"Email all ready"</em> to send in bulk.</p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
          <div className="admin-stat">
            <div className="label">Pending</div>
            <div className="value">{queued}</div>
            <div className="hint">Awaiting action</div>
          </div>
          <div className="admin-stat">
            <div className="label">Ready to send</div>
            <div className="value">{generated}</div>
            <div className="hint">Link ready, not emailed</div>
          </div>
          <div className="admin-stat">
            <div className="label">Emailed</div>
            <div className="value">{sent}</div>
            <div className="hint">Runner received it</div>
          </div>
        </div>

        {/* ── Bulk action bar ── */}
        <div className="rounded-xl border border-[var(--admin-line)] bg-[var(--admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] mb-3">Bulk actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkBusy || queued === 0}
              onClick={() => void runBulk("/api/admin/certificates/bulk-generate?limit=50", "Generate pending")}
              className="btn btn-secondary h-9 gap-2 text-sm disabled:opacity-40"
            >
              <FileCheck className="h-4 w-4" />
              Generate pending ({queued})
              <span className="text-xs text-[var(--admin-muted)]">— creates verify links</span>
            </button>

            <button
              type="button"
              disabled={bulkBusy || (generated === 0 && queued === 0)}
              onClick={() => void runBulk("/api/admin/certificates/bulk-send?limit=50", "Email all ready")}
              className="btn btn-primary h-9 gap-2 text-sm disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Email all ready ({generated})
              <span className="text-xs text-white/70">— sends to runners</span>
            </button>

            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void load()}
              className="btn btn-ghost h-9"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Filter ── */}
        <div className="admin-toolbar is-two">
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All certificates</option>
            <option value="QUEUED">Pending only</option>
            <option value="GENERATED">Ready to email only</option>
            <option value="SENT">Emailed only</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="table-wrap table-scroll admin-fill">
          {items.length === 0 ? (
            <div className="admin-panel-pad">
              <AdminEmpty>
                {statusFilter
                  ? `No certificates with status "${statusFilter}".`
                  : "No certificates yet — approve a GPS proof to create one."}
              </AdminEmpty>
            </div>
          ) : (
            <table className="table-clean min-w-[860px]">
              <thead>
                <tr>
                  <th>Runner</th>
                  <th>Event</th>
                  <th>Cert #</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const busy = busyId === row.id;
                  const statusInfo = STATUS_INFO[row.status] ?? { label: row.status, color: "badge", hint: "" };
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="strong">{row.registration.user.name}</div>
                        <div className="admin-muted text-xs">{row.registration.user.email}</div>
                      </td>
                      <td>
                        <div className="text-sm">{row.registration.event.title}</div>
                        <div className="admin-muted text-xs">Bib {row.registration.bibNumber}</div>
                      </td>
                      <td className="font-mono text-xs strong">{row.certificateNumber}</td>
                      <td>
                        <span className={statusInfo.color} title={statusInfo.hint}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="text-xs text-[var(--admin-muted)]">
                        {row.issuedAt ? formatDateTime(row.issuedAt) : "—"}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {/* Only show Generate if not yet generated */}
                          {row.status === "QUEUED" && (
                            <button type="button" disabled={busy}
                              onClick={() => void runAction(row.id, `/api/admin/certificates/${row.id}/generate`, `Verify link created for ${row.registration.user.name}`)}
                              className="btn btn-secondary h-8 px-2.5 text-xs gap-1 disabled:opacity-40"
                            >
                              <FileCheck className="h-3.5 w-3.5" /> Generate link
                            </button>
                          )}

                          {/* Send email — available for GENERATED and QUEUED */}
                          {row.status !== "SENT" && (
                            <button type="button" disabled={busy}
                              onClick={() => void runAction(row.id, `/api/admin/certificates/${row.id}/send`, `Certificate emailed to ${row.registration.user.email}`)}
                              className="btn btn-primary h-8 px-2.5 text-xs gap-1 disabled:opacity-40"
                            >
                              <Mail className="h-3.5 w-3.5" /> Send email
                            </button>
                          )}

                          {/* Re-send if already sent */}
                          {row.status === "SENT" && (
                            <button type="button" disabled={busy}
                              onClick={() => void runAction(row.id, `/api/admin/certificates/${row.id}/send`, `Re-sent certificate to ${row.registration.user.email}`)}
                              className="btn btn-secondary h-8 px-2.5 text-xs gap-1 disabled:opacity-40"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Re-send
                            </button>
                          )}

                          {/* View certificate */}
                          <Link href={`/certificates/${row.certificateNumber}`} target="_blank"
                            className="btn btn-ghost h-8 w-8 items-center justify-center p-0"
                            title="View certificate">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
