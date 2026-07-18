"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";

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

export default function AdminCertificatesPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<CertRow[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (status) params.set("status", status);
      const json = await adminFetch<{ data: CertRow[] }>(
        `/api/admin/certificates?${params}`,
        token,
      );
      setItems(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(
    id: string,
    path: string,
    successHint: string,
  ) {
    setBusyId(id);
    setInfo(null);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: CertRow; meta?: { email?: { sent?: boolean; error?: string } } }>(
        path,
        token,
        { method: "POST" },
      );
      const emailMeta = json.meta?.email;
      if (emailMeta && emailMeta.sent === false) {
        setInfo(`${successHint} Email not sent: ${emailMeta.error ?? "check RESEND_API_KEY"}`);
      } else {
        setInfo(successHint);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function bulk(path: string, label: string) {
    setBulkBusy(true);
    setInfo(null);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ meta?: { count?: number; sent?: number } }>(path, token, {
        method: "POST",
      });
      const count = json.meta?.count ?? 0;
      const sent = json.meta?.sent;
      setInfo(
        sent != null
          ? `${label}: emailed ${sent}/${count}`
          : `${label}: processed ${count}`,
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  }

  const queued = items.filter((i) => i.status === "QUEUED").length;
  const generated = items.filter((i) => i.status === "GENERATED").length;

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Fulfillment"
        title="Certificates"
        description="Generate public certificates, email runners, and run bulk actions. Approve proof first — certs are auto-queued."
        actions={
          <div className="admin-actions">
            <button
              className="btn btn-secondary"
              disabled={bulkBusy}
              onClick={() => void bulk("/api/admin/certificates/bulk-generate?limit=50", "Bulk generate")}
              type="button"
            >
              Bulk generate queued
            </button>
            <button
              className="btn btn-primary"
              disabled={bulkBusy}
              onClick={() => void bulk("/api/admin/certificates/bulk-send?limit=50", "Bulk send")}
              type="button"
            >
              Bulk email ready
            </button>
            <button className="btn btn-ghost" onClick={() => void load()} type="button">
              Refresh
            </button>
          </div>
        }
      />

      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <div className="admin-stat">
          <div className="label">Queued</div>
          <div className="value">{queued}</div>
          <div className="hint">Waiting generate</div>
        </div>
        <div className="admin-stat">
          <div className="label">Generated</div>
          <div className="value">{generated}</div>
          <div className="hint">Ready to email</div>
        </div>
        <div className="admin-stat">
          <div className="label">Showing</div>
          <div className="value">{items.length}</div>
          <div className="hint">This page</div>
        </div>
      </div>

      <div className="admin-toolbar is-two">
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All statuses</option>
          {["QUEUED", "GENERATED", "SENT"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="admin-muted" style={{ color: "var(--admin-danger)" }}>
          {error}
        </p>
      ) : null}
      {info ? <p className="admin-success">{info}</p> : null}

      <div className="table-wrap table-scroll admin-fill">
        {items.length === 0 ? (
          <div className="admin-panel-pad">
            <AdminEmpty>No certificates yet. Approve a GPS proof to queue one.</AdminEmpty>
          </div>
        ) : (
          <table className="table-clean min-w-[900px]">
            <thead>
              <tr>
                {["Number", "Runner", "Event", "Bib", "Status", "Actions"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const busy = busyId === row.id;
                return (
                  <tr key={row.id}>
                    <td className="font-mono text-xs strong">{row.certificateNumber}</td>
                    <td>
                      <div className="strong">{row.registration.user.name}</div>
                      <div className="admin-muted text-xs">{row.registration.user.email}</div>
                    </td>
                    <td>{row.registration.event.title}</td>
                    <td className="font-mono text-xs">{row.registration.bibNumber}</td>
                    <td>
                      <span className="badge">{row.status}</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        <button
                          className="btn btn-secondary h-8 px-2 text-xs"
                          disabled={busy}
                          onClick={() =>
                            void runAction(
                              row.id,
                              `/api/admin/certificates/${row.id}/generate`,
                              `Generated ${row.certificateNumber}`,
                            )
                          }
                          type="button"
                        >
                          Generate
                        </button>
                        <button
                          className="btn btn-primary h-8 px-2 text-xs"
                          disabled={busy}
                          onClick={() =>
                            void runAction(
                              row.id,
                              `/api/admin/certificates/${row.id}/send`,
                              `Send attempted for ${row.certificateNumber}`,
                            )
                          }
                          type="button"
                        >
                          Email
                        </button>
                        <button
                          className="btn btn-secondary h-8 px-2 text-xs"
                          disabled={busy}
                          onClick={() =>
                            void runAction(
                              row.id,
                              `/api/admin/certificates/${row.id}/generate-and-send`,
                              `Generate + email for ${row.certificateNumber}`,
                            )
                          }
                          type="button"
                        >
                          Gen + email
                        </button>
                        <Link
                          className="btn btn-ghost h-8 px-2 text-xs"
                          href={`/certificates/${row.certificateNumber}`}
                          target="_blank"
                        >
                          Open
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
  );
}
