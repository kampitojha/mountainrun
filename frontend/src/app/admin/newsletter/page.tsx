"use client";

import { useAuth } from "@clerk/nextjs";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStat } from "../ui";

type Subscriber = {
  id: string;
  email: string;
  subscribed: boolean;
  createdAt: string;
};

export default function AdminNewsletterPage() {
  const { getToken } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: Subscriber[]; meta: { total: number } }>("/api/admin/subscribers", token);
      setSubscribers(json.data);
      setTotal(json.meta.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: { sent: number; total: number; message: string } }>(
        "/api/admin/newsletter/send",
        token,
        {
          method: "POST",
          body: JSON.stringify({ subject, body }),
        },
      );
      setResult(json.data.message);
      setSubject("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Growth"
        title="Newsletter"
        description="View subscribers and send broadcast emails."
      />

      {error ? <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p> : null}

      <div className="admin-layout-split is-form-list admin-fill">
        {/* Compose */}
        <form className="admin-panel admin-panel-pad admin-form-grid" onSubmit={onSend}>
          <h2 className="admin-panel-title span-2">Compose newsletter</h2>

          <label className="block text-sm span-2">
            <span className="field-label">Subject</span>
            <input
              className="input"
              onChange={(e) => setSubject(e.target.value)}
              placeholder="New event announcement"
              required
              value={subject}
              maxLength={200}
            />
          </label>

          <label className="block text-sm span-2">
            <span className="field-label">Body (HTML)</span>
            <textarea
              className="input"
              onChange={(e) => setBody(e.target.value)}
              placeholder="<h2>Hello runners!</h2><p>Your newsletter content here...</p>"
              required
              value={body}
              rows={12}
              maxLength={10000}
              style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}
            />
          </label>

          <div className="span-2 flex items-center gap-3">
            <button className="btn btn-primary" disabled={sending || total === 0} type="submit">
              {sending ? "Sending…" : `Send to ${total} subscriber${total !== 1 ? "s" : ""}`}
            </button>
            {total === 0 ? <span className="text-xs text-(--muted)">No active subscribers</span> : null}
          </div>

          {result ? <p className="span-2 text-sm text-(--sage)">{result}</p> : null}
        </form>

        {/* Subscriber list */}
        <div className="admin-stack">
          <AdminPanel title={`${total} active subscriber${total !== 1 ? "s" : ""}`}>
            {subscribers.length === 0 ? (
              <AdminEmpty>No subscribers yet.</AdminEmpty>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="font-mono text-sm">{sub.email}</td>
                        <td className="text-xs text-(--muted)">{formatDateTime(sub.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
