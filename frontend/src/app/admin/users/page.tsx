"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
import { AdminPageHeader } from "../ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  clerkId: string | null;
  createdAt: string;
  _count?: { registrations: number };
};

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "50" });
      if (q.trim()) params.set("q", q.trim());
      if (role) params.set("role", role);
      const json = await adminFetch<{ data: UserRow[] }>(`/api/admin/users?${params}`, token);
      setItems(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, q, role]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="People"
        title="Users"
        description="Search runners and admins. Open a profile for full history."
      />

      <div className="admin-toolbar">
        <input
          className="input"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, phone, clerk id"
          value={q}
        />
        <select className="input" onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="">All roles</option>
          {["RUNNER", "ADMIN", "SUPER_ADMIN"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => void load()} type="button">
          Refresh
        </button>
      </div>

      {error ? <p className="admin-muted" style={{ color: "var(--admin-danger)" }}>{error}</p> : null}

      <div className="table-wrap table-scroll admin-fill">
        <table className="table-clean min-w-[720px]">
          <thead>
            <tr>
              {["Name", "Email", "Phone", "Role", "Regs", "Joined", ""].map((h) => (
                <th key={h || "a"}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id}>
                <td className="strong">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone ?? "—"}</td>
                <td>
                  <span className="badge">{user.role}</span>
                </td>
                <td>{user._count?.registrations ?? 0}</td>
                <td className="text-xs">{formatDateTime(user.createdAt)}</td>
                <td>
                  <Link
                    className="text-sm font-medium underline-offset-2 hover:underline"
                    href={`/admin/users/${user.id}`}
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
