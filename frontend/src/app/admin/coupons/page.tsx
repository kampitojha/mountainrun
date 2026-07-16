"use client";

import { useAuth } from "@clerk/nextjs";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel } from "../ui";

type Coupon = {
  id: string;
  code: string;
  discountPaise: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [discountInr, setDiscountInr] = useState("100");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: Coupon[] }>("/api/admin/coupons", token);
      setItems(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      const token = await getToken().catch(() => null);
      await adminFetch("/api/admin/coupons", token, {
        method: "POST",
        body: JSON.stringify({
          code,
          discountPaise: Math.round(Number(discountInr) * 100),
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
          active: true,
        }),
      });
      setCode("");
      setDiscountInr("100");
      setMaxRedemptions("");
      setMessage("Coupon created.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/coupons/${coupon.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ active: !coupon.active }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/coupons/${id}`, token, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <AdminPageHeader
        kicker="Growth"
        title="Coupons"
        description="Create and manage discount codes for checkout."
      />

      {error ? <p className="admin-muted" style={{ color: "var(--admin-danger)", marginBottom: "0.75rem" }}>{error}</p> : null}
      {message ? <p className="admin-muted" style={{ marginBottom: "0.75rem" }}>{message}</p> : null}

      <form className="admin-panel admin-panel-pad grid max-w-xl gap-3 sm:grid-cols-2" onSubmit={onCreate}>
        <label className="block text-sm sm:col-span-2">
          <span className="field-label">Code</span>
          <input
            className="input"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MONSOON100"
            required
            value={code}
          />
        </label>
        <label className="block text-sm">
          <span className="field-label">Discount (INR)</span>
          <input
            className="input"
            inputMode="numeric"
            onChange={(e) => setDiscountInr(e.target.value)}
            required
            value={discountInr}
          />
        </label>
        <label className="block text-sm">
          <span className="field-label">Max redemptions</span>
          <input
            className="input"
            inputMode="numeric"
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder="Unlimited"
            value={maxRedemptions}
          />
        </label>
        <button className="btn btn-primary sm:col-span-2" type="submit">
          Create coupon
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {items.map((coupon) => (
          <article className="admin-panel admin-panel-pad flex flex-wrap items-center justify-between gap-3" key={coupon.id}>
            <div>
              <p className="font-mono text-sm font-semibold">{coupon.code}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {formatInrFromPaise(coupon.discountPaise)} off · used {coupon.redeemedCount}
                {coupon.maxRedemptions != null ? ` / ${coupon.maxRedemptions}` : ""}
                {coupon.expiresAt ? ` · expires ${formatDateTime(coupon.expiresAt)}` : ""}
              </p>
              <span className="badge mt-2">{coupon.active ? "ACTIVE" : "OFF"}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary h-9 px-3"
                onClick={() => void toggleActive(coupon)}
                type="button"
              >
                {coupon.active ? "Disable" : "Enable"}
              </button>
              <button
                className="btn btn-ghost h-9 px-3 text-[var(--danger)]"
                onClick={() => void remove(coupon.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <div className="admin-panel admin-panel-pad">
            <AdminEmpty>No coupons yet.</AdminEmpty>
          </div>
        ) : null}
      </div>
    </div>
  );
}
