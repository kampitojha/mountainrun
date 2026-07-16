"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { authHeaders, getApiUrl } from "../../../lib/api";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../lib/admin-api";
import { AdminPageHeader } from "../ui";

type Row = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  registeredAt: string;
  user: { name: string; email: string };
  event: { title: string };
  payment?: { status: string; amountInPaise: number } | null;
};

export default function AdminRegistrationsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      const json = await adminFetch<{ data: Row[]; meta: { total: number } }>(
        `/api/admin/registrations?${params}`,
        token,
      );
      setItems(json.data);
      setTotal(json.meta.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function exportCsv() {
    const token = await getToken().catch(() => null);
    const response = await fetch(getApiUrl("/api/admin/registrations/export.csv"), {
      headers: authHeaders(token),
    });
    if (!response.ok) {
      setError("Export failed");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Operations"
        title="Registrations"
        description={`${total} total · search, filter, open a runner dossier.`}
        actions={
          <button className="btn btn-secondary" onClick={() => void exportCsv()} type="button">
            Export CSV
          </button>
        }
      />

      <div className="admin-toolbar">
        <input
          className="input"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, bib, phone"
          value={q}
        />
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All statuses</option>
          {["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => void load()} type="button">
          Refresh
        </button>
      </div>

      {error ? <p className="admin-muted" style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      <div className="table-wrap table-scroll admin-fill">
        <table className="table-clean min-w-[800px]">
          <thead>
            <tr>
              {["Bib", "Runner", "Event", "Distance", "Status", "Proof", "Pay", "When", ""].map(
                (h) => (
                  <th key={h || "actions"}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td className="font-mono text-xs">{row.bibNumber}</td>
                <td className="strong">
                  <div>{row.user.name}</div>
                  <div className="text-xs font-normal text-[var(--muted)]">{row.user.email}</div>
                </td>
                <td>{row.event.title}</td>
                <td>{row.distance}</td>
                <td>
                  <span className="badge">{row.status}</span>
                </td>
                <td>
                  <span className="badge">{row.proofStatus}</span>
                </td>
                <td>
                  {row.payment
                    ? `${row.payment.status} · ${formatInrFromPaise(row.payment.amountInPaise)}`
                    : "—"}
                </td>
                <td className="text-xs">{formatDateTime(row.registeredAt)}</td>
                <td>
                  <Link
                    className="text-sm font-medium underline-offset-2 hover:underline"
                    href={`/admin/registrations/${row.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
