"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../../lib/admin-api";

type RegistrationDetail = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  finishTimeSeconds: number | null;
  adminNote: string | null;
  registeredAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  user: { id: string; name: string; email: string; phone: string | null; role: string };
  event: { id: string; title: string; slug: string; priceInPaise: number };
  payment?: {
    id: string;
    status: string;
    amountInPaise: number;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    paidAt: string | null;
  } | null;
  proofUpload?: {
    activityImageUrl: string;
    sourceApp: string;
    status: string;
    reviewerNote: string | null;
  } | null;
  certificate?: { id: string; certificateNumber: string; status: string } | null;
  medalDelivery?: {
    id: string;
    status: string;
    courier: string | null;
    trackingNumber: string | null;
  } | null;
};

export default function AdminRegistrationDetailPage() {
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [data, setData] = useState<RegistrationDetail | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: RegistrationDetail }>(
        `/api/admin/registrations/${params.id}`,
        token,
      );
      setData(json.data);
      setNote(json.data.adminNote ?? "");
      setStatus(json.data.status);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!data) return;
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${data.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNote: note }),
      });
      setMessage("Saved.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function markPaid() {
    if (!data) return;
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${data.id}/mark-paid`, token, {
        method: "POST",
        body: JSON.stringify({ note: "Marked paid by admin" }),
      });
      setMessage("Marked as paid.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Mark paid failed");
    }
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }
  if (!data) {
    return <p className="text-sm text-[var(--muted)]">Loading…</p>;
  }

  return (
    <div>
      <Link className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" href="/admin/registrations">
        ← Registrations
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Registration</p>
          <h1 className="heading mt-2">{data.bibNumber}</h1>
          <p className="lede mt-2">
            {data.user.name} · {data.event.title} · {data.distance}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.status === "PENDING_PAYMENT" ? (
            <button className="btn btn-primary h-9" onClick={() => void markPaid()} type="button">
              Mark paid
            </button>
          ) : null}
          <Link className="btn btn-secondary h-9" href={`/admin/users/${data.user.id}`}>
            View user
          </Link>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-[var(--muted)]">{message}</p> : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <h2 className="text-base font-semibold">Runner & shipping</h2>
          <p className="text-sm text-[var(--muted)]">
            {data.user.email}
            {data.user.phone ? ` · ${data.user.phone}` : ""}
          </p>
          <p className="text-sm">
            {data.shippingName}
            <br />
            {data.shippingLine1}
            {data.shippingLine2 ? (
              <>
                <br />
                {data.shippingLine2}
              </>
            ) : null}
            <br />
            {data.shippingCity}, {data.shippingState} {data.shippingPincode}
            <br />
            {data.shippingPhone}
          </p>
          <p className="text-xs text-[var(--muted-soft)]">
            Registered {formatDateTime(data.registeredAt)}
          </p>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-base font-semibold">Payment</h2>
          {data.payment ? (
            <>
              <p className="text-sm">
                {data.payment.status} · {formatInrFromPaise(data.payment.amountInPaise)}
              </p>
              <p className="font-mono text-xs text-[var(--muted)]">
                order: {data.payment.razorpayOrderId}
              </p>
              {data.payment.razorpayPaymentId ? (
                <p className="font-mono text-xs text-[var(--muted)]">
                  payment: {data.payment.razorpayPaymentId}
                </p>
              ) : null}
              <p className="text-xs text-[var(--muted-soft)]">
                Paid at {formatDateTime(data.payment.paidAt)}
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">No payment record.</p>
          )}
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-base font-semibold">Proof</h2>
          <p className="text-sm">
            Status: <span className="badge">{data.proofStatus}</span>
          </p>
          {data.finishTimeSeconds != null ? (
            <p className="text-sm text-[var(--muted)]">Finish seconds: {data.finishTimeSeconds}</p>
          ) : null}
          {data.proofUpload ? (
            <>
              <p className="text-sm text-[var(--muted)]">Source: {data.proofUpload.sourceApp}</p>
              <a
                className="text-sm font-medium underline-offset-2 hover:underline"
                href={data.proofUpload.activityImageUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open activity image
              </a>
              {data.proofUpload.reviewerNote ? (
                <p className="text-sm text-[var(--muted)]">Note: {data.proofUpload.reviewerNote}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">No proof uploaded.</p>
          )}
          {data.proofStatus === "SUBMITTED" ? (
            <Link className="btn btn-secondary h-9" href="/admin/proofs">
              Open proof queue
            </Link>
          ) : null}
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-base font-semibold">Fulfillment</h2>
          <p className="text-sm">
            Certificate:{" "}
            {data.certificate
              ? `${data.certificate.certificateNumber} (${data.certificate.status})`
              : "—"}
          </p>
          <p className="text-sm">
            Medal:{" "}
            {data.medalDelivery
              ? `${data.medalDelivery.status}${
                  data.medalDelivery.trackingNumber
                    ? ` · ${data.medalDelivery.trackingNumber}`
                    : ""
                }`
              : "—"}
          </p>
        </section>

        <section className="card space-y-3 p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Admin controls</h2>
          <label className="block max-w-xs text-sm">
            <span className="field-label">Status</span>
            <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
              {["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="field-label">Internal note</span>
            <textarea
              className="input min-h-24 py-2"
              onChange={(e) => setNote(e.target.value)}
              value={note}
            />
          </label>
          <button className="btn btn-primary" onClick={() => void save()} type="button">
            Save changes
          </button>
        </section>
      </div>
    </div>
  );
}
