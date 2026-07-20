"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";

type MedalRow = {
  id: string;
  status: string;
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  registration: {
    bibNumber: string;
    shippingName?: string;
    shippingCity?: string;
    shippingPincode?: string;
    user: { name: string; email: string; phone: string | null };
    event: { title: string };
  };
};

export default function AdminMedalsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<MedalRow[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (status) params.set("status", status);
      const json = await adminFetch<{ data: MedalRow[] }>(`/api/admin/medals?${params}`, token);
      setItems(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateMedal(
    id: string,
    patch: { status: string; courier?: string; trackingNumber?: string },
  ) {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/medals/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Fulfillment"
        title="Medals"
        description="Dispatch tracking for finisher medals."
      />

      <div className="admin-toolbar is-two">
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All statuses</option>
          {["PENDING", "DISPATCHED", "DELIVERED", "RETURNED", "NOT_ELIGIBLE"].map((s) => (
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

      <div className="admin-stack admin-fill">
        {items.map((row) => (
          <article className="admin-panel admin-panel-pad" key={row.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {row.registration.user.name} · {row.registration.bibNumber}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {row.registration.event.title} · {row.registration.user.email}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-soft)]">
                  Status: {row.status}
                  {row.courier ? ` · ${row.courier}` : ""}
                  {row.trackingNumber ? ` · ${row.trackingNumber}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {row.status === "PENDING" ? (
                  <button
                    className="btn btn-primary h-9 px-3"
                    onClick={() => {
                      const courier = window.prompt("Courier name", row.courier ?? "India Post") ?? undefined;
                      const trackingNumber =
                        window.prompt("Tracking number", row.trackingNumber ?? "") ?? undefined;
                      void updateMedal(row.id, {
                        status: "DISPATCHED",
                        courier,
                        trackingNumber,
                      });
                    }}
                    type="button"
                  >
                    Mark dispatched
                  </button>
                ) : null}
                {row.status === "DISPATCHED" ? (
                  <button
                    className="btn btn-secondary h-9 px-3"
                    onClick={() => void updateMedal(row.id, { status: "DELIVERED" })}
                    type="button"
                  >
                    Mark delivered
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <div className="admin-panel admin-panel-pad is-fill">
            <AdminEmpty>No medal rows yet.</AdminEmpty>
          </div>
        ) : null}
      </div>
    </div>
  );
}
