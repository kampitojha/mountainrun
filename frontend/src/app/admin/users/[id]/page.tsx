"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../../lib/admin-api";

type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  clerkId: string | null;
  createdAt: string;
  registrations: Array<{
    id: string;
    bibNumber: string;
    distance: string;
    status: string;
    proofStatus: string;
    registeredAt: string;
    event: { title: string };
    payment?: { status: string; amountInPaise: number } | null;
  }>;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [data, setData] = useState<UserDetail | null>(null);
  const [role, setRole] = useState("RUNNER");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: UserDetail }>(`/api/admin/users/${params.id}`, token);
      setData(json.data);
      setRole(json.data.role);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveRole() {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/users/${params.id}/role`, token, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setMessage("Role updated.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (error) return <p className="text-sm text-[var(--danger)]">{error}</p>;
  if (!data) return <p className="text-sm text-[var(--muted)]">Loading…</p>;

  return (
    <div>
      <Link className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]" href="/admin/users">
        ← Users
      </Link>
      <h1 className="heading mt-4">{data.name}</h1>
      <p className="lede mt-2">
        {data.email}
        {data.phone ? ` · ${data.phone}` : ""}
      </p>
      <p className="mt-2 text-xs text-[var(--muted-soft)]">
        Joined {formatDateTime(data.createdAt)}
        {data.clerkId ? ` · clerk ${data.clerkId}` : ""}
      </p>

      {message ? <p className="mt-4 text-sm text-[var(--muted)]">{message}</p> : null}

      <section className="card mt-8 max-w-md space-y-3 p-5">
        <h2 className="text-base font-semibold">Role</h2>
        <select className="input" onChange={(e) => setRole(e.target.value)} value={role}>
          {["RUNNER", "ADMIN", "SUPER_ADMIN"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => void saveRole()} type="button">
          Save role
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">Registrations</h2>
        <div className="mt-4 space-y-2">
          {data.registrations.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No registrations.</p>
          ) : (
            data.registrations.map((reg) => (
              <Link
                className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-[var(--panel-soft)]"
                href={`/admin/registrations/${reg.id}`}
                key={reg.id}
              >
                <div>
                  <p className="text-sm font-medium">
                    {reg.event.title} · {reg.distance}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {reg.bibNumber} · {reg.status} · proof {reg.proofStatus}
                  </p>
                </div>
                <div className="text-right text-sm">
                  {reg.payment
                    ? `${reg.payment.status} · ${formatInrFromPaise(reg.payment.amountInPaise)}`
                    : "No payment"}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
