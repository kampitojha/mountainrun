"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../../lib/admin-api";
import { AdminBackLink, AdminEmpty, AdminPageHeader, AdminPanel } from "../../ui";

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
    <div className="admin-stack">
      <div>
        <AdminBackLink href="/admin/users" label="Users" />
      </div>
      <AdminPageHeader
        kicker="People"
        title={data.name}
        description={`${data.email}${data.phone ? ` · ${data.phone}` : ""} · joined ${formatDateTime(data.createdAt)}`}
      />

      {message ? <p className="admin-muted">{message}</p> : null}

      <div className="admin-layout-split is-aside-main admin-fill">
        <AdminPanel fill title="Role">
          <div className="space-y-3">
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
            {data.clerkId ? (
              <p className="text-xs admin-muted font-mono">clerk {data.clerkId}</p>
            ) : null}
          </div>
        </AdminPanel>

        <AdminPanel fill title="Registrations" subtitle={`${data.registrations.length} total`}>
          {data.registrations.length === 0 ? (
            <AdminEmpty>No registrations.</AdminEmpty>
          ) : (
            <div className="admin-list is-stretch">
              {data.registrations.map((reg) => (
                <Link className="admin-list-item" href={`/admin/registrations/${reg.id}`} key={reg.id}>
                  <div>
                    <div className="title">
                      {reg.event.title} · {reg.distance}
                    </div>
                    <div className="sub">
                      {reg.bibNumber} · {reg.status} · proof {reg.proofStatus}
                    </div>
                  </div>
                  <div className="right sub">
                    {reg.payment
                      ? `${reg.payment.status} · ${formatInrFromPaise(reg.payment.amountInPaise)}`
                      : "No payment"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
