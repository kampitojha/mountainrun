"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../../lib/admin-api";
import { parseProofImages } from "../../../../lib/proof-utils";
import { AdminBackLink, AdminPageHeader, AdminPanel } from "../../ui";

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
  event: { id: string; title: string; slug: string; priceInPaise: number; distances?: string[] };
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
  const [distance, setDistance] = useState("");
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
      setDistance(json.data.distance ?? "");
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
        body: JSON.stringify({ status, distance, adminNote: note }),
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
    <div className="admin-stack">
      <div>
        <AdminBackLink href="/admin/registrations" label="Registrations" />
      </div>
      <AdminPageHeader
        kicker="Registration"
        title={data.bibNumber}
        description={`${data.user.name} · ${data.event.title} · ${data.distance}`}
        actions={
          <>
            {data.status === "PENDING_PAYMENT" ? (
              <button className="btn btn-primary" onClick={() => void markPaid()} type="button">
                Mark paid
              </button>
            ) : null}
            <Link className="btn btn-secondary" href={`/admin/users/${data.user.id}`}>
              View user
            </Link>
          </>
        }
      />

      {message ? <p className="admin-muted">{message}</p> : null}

      <div className="admin-layout-split is-equal">
        <AdminPanel title="Runner & shipping">
          <div className="space-y-2 text-sm admin-muted">
            <p>
              {data.user.email}
              {data.user.phone ? ` · ${data.user.phone}` : ""}
            </p>
            <p style={{ color: "var(--foreground)" }}>
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
            <p className="text-xs">Registered {formatDateTime(data.registeredAt)}</p>
          </div>
        </AdminPanel>

        <AdminPanel title="Payment">
          {data.payment ? (
            <div className="space-y-2 text-sm admin-muted">
              <p style={{ color: "var(--foreground)" }}>
                {data.payment.status} · {formatInrFromPaise(data.payment.amountInPaise)}
              </p>
              <p className="font-mono text-xs">order: {data.payment.razorpayOrderId}</p>
              {data.payment.razorpayPaymentId ? (
                <p className="font-mono text-xs">payment: {data.payment.razorpayPaymentId}</p>
              ) : null}
              <p className="text-xs">Paid at {formatDateTime(data.payment.paidAt)}</p>
            </div>
          ) : (
            <p className="text-sm admin-muted">No payment record.</p>
          )}
        </AdminPanel>

        <AdminPanel title="Proof">
          <div className="space-y-2 text-sm">
            <p>
              Status: <span className="badge">{data.proofStatus}</span>
            </p>
            {data.finishTimeSeconds != null ? (
              <p className="admin-muted">Finish seconds: {data.finishTimeSeconds}</p>
            ) : null}
            {data.proofUpload ? (
              <>
                <p className="admin-muted">Source: {data.proofUpload.sourceApp}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {parseProofImages(data.proofUpload.activityImageUrl).map((img, i) => (
                    <a
                      key={i}
                      className="group relative block overflow-hidden rounded-xl border border-[var(--line)] aspect-video bg-black/5 hover:border-[var(--sage)] transition-colors"
                      href={img}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={`GPS proof screenshot ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        src={img}
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[0.65rem] font-mono text-white">
                        #{i + 1}
                      </span>
                    </a>
                  ))}
                </div>
                {data.proofUpload.reviewerNote ? (
                  <p className="admin-muted mt-2">Note: {data.proofUpload.reviewerNote}</p>
                ) : null}
              </>
            ) : (
              <p className="admin-muted">No proof uploaded.</p>
            )}
            {data.proofStatus === "SUBMITTED" ? (
              <div style={{ marginTop: "0.75rem" }}>
                <Link className="btn btn-secondary" href="/admin/proofs">
                  Open proof queue
                </Link>
              </div>
            ) : null}
          </div>
        </AdminPanel>

        <AdminPanel title="Fulfillment">
          <div className="space-y-2 text-sm admin-muted">
            <p>
              Certificate:{" "}
              {data.certificate
                ? `${data.certificate.certificateNumber} (${data.certificate.status})`
                : "—"}
            </p>
            <p>
              Medal:{" "}
              {data.medalDelivery
                ? `${data.medalDelivery.status}${
                    data.medalDelivery.trackingNumber
                      ? ` · ${data.medalDelivery.trackingNumber}`
                      : ""
                  }`
                : "—"}
            </p>
          </div>
        </AdminPanel>

        <AdminPanel className="span-2" title="Admin controls">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
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
                <span className="field-label">Distance</span>
                {data.event.distances && data.event.distances.length > 0 ? (
                  <select
                    className="input"
                    onChange={(e) => setDistance(e.target.value)}
                    value={distance}
                  >
                    {data.event.distances.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="input"
                    onChange={(e) => setDistance(e.target.value)}
                    type="text"
                    value={distance}
                  />
                )}
              </label>
            </div>
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
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
