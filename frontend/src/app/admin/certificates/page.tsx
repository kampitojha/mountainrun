"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import { AdminPageHeader } from "../ui";

type CertRow = {
  id: string;
  certificateNumber: string;
  status: string;
  pdfUrl: string | null;
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

  async function setCertStatus(id: string, next: string) {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/certificates/${id}`, token, {
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
        kicker="Fulfillment"
        title="Certificates"
        description="Queue, generate, and mark sent."
      />

      <div className="admin-toolbar is-two">
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All</option>
          {["QUEUED", "GENERATED", "SENT"].map((s) => (
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
        <table className="table-clean min-w-[720px]">
          <thead>
            <tr>
              {["Number", "Runner", "Event", "Bib", "Status", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td className="font-mono text-xs">{row.certificateNumber}</td>
                <td className="strong">{row.registration.user.name}</td>
                <td>{row.registration.event.title}</td>
                <td className="font-mono text-xs">{row.registration.bibNumber}</td>
                <td>
                  <span className="badge">{row.status}</span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {row.status === "QUEUED" ? (
                      <button
                        className="btn btn-secondary h-8 px-2 text-xs"
                        onClick={() => void setCertStatus(row.id, "GENERATED")}
                        type="button"
                      >
                        Mark generated
                      </button>
                    ) : null}
                    {row.status !== "SENT" ? (
                      <button
                        className="btn btn-primary h-8 px-2 text-xs"
                        onClick={() => void setCertStatus(row.id, "SENT")}
                        type="button"
                      >
                        Mark sent
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
