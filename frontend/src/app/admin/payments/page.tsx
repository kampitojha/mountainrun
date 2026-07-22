"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../lib/admin-api";
import { AdminPageHeader } from "../ui";

type PaymentRow = {
  id: string;
  status: string;
  amountInPaise: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: string;
  paidAt: string | null;
  registration: {
    bibNumber: string;
    user: { name: string; email: string };
    event: { title: string };
  };
};

export default function AdminPaymentsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [meta, setMeta] = useState({ paidCount: 0, paidRevenueInPaise: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const json = await adminFetch<{
        data: PaymentRow[];
        meta: { paidCount: number; paidRevenueInPaise: number; total: number };
      }>(`/api/admin/payments?${params}`, token);
      setItems(json.data);
      setMeta(json.meta);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setPaymentStatus(id: string, next: string) {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/payments/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Finance"
        title="Payments"
        description={`Paid ${meta.paidCount} · Revenue ${formatInrFromPaise(meta.paidRevenueInPaise)}`}
      />

      <div className="admin-toolbar">
        <input
          className="input"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order id, email, bib"
          value={q}
        />
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All</option>
          {["CREATED", "PAID", "FAILED", "REFUNDED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => void load()} type="button">
          Refresh
        </button>
      </div>

      {error ? <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p> : null}

      <div className="table-wrap table-scroll admin-fill">
        <table className="table-clean min-w-[860px]">
          <thead>
            <tr>
              {["Amount", "Status", "Runner", "Event", "Bib", "Order", "When", "Actions"].map(
                (h) => (
                  <th key={h}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td className="strong">{formatInrFromPaise(row.amountInPaise)}</td>
                <td>
                  <span className="badge">{row.status}</span>
                </td>
                <td>
                  <div className="text-sm">{row.registration.user.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {row.registration.user.email}
                  </div>
                </td>
                <td>{row.registration.event.title}</td>
                <td className="font-mono text-xs">{row.registration.bibNumber}</td>
                <td className="max-w-[10rem] truncate font-mono text-xs">
                  {row.razorpayOrderId}
                </td>
                <td className="text-xs">{formatDateTime(row.paidAt ?? row.createdAt)}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {row.status !== "PAID" ? (
                      <button
                        className="btn btn-secondary h-8 px-2 text-xs"
                        onClick={() => void setPaymentStatus(row.id, "PAID")}
                        type="button"
                      >
                        Mark paid
                      </button>
                    ) : null}
                    {row.status === "PAID" ? (
                      <button
                        className="btn btn-ghost h-8 px-2 text-xs"
                        onClick={() => void setPaymentStatus(row.id, "REFUNDED")}
                        type="button"
                      >
                        Refund
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
