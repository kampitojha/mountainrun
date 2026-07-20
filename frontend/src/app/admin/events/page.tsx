"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  adminFetch,
  formatDateTime,
  formatInrFromPaise,
  toDatetimeLocalValue,
} from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  startsAt: string;
  endsAt: string;
  distances: string[];
  priceInPaise: number;
  paymentRequired: boolean;
  medalIncluded: boolean;
  featured: boolean;
  maxCapacity: number | null;
  city: string | null;
  _count?: { registrations: number };
};

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  startsAt: "",
  endsAt: "",
  proofClosesAt: "",
  distances: "5 km, 10 km",
  priceInr: "499",
  paymentRequired: true,
  medalIncluded: true,
  featured: false,
  maxCapacity: "",
  city: "Virtual",
  status: "DRAFT",
};

export default function AdminEventsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<EventRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: EventRow[] }>("/api/admin/events?pageSize=50", token);
      setItems(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  function slugify(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  function startEdit(event: EventRow) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      slug: event.slug,
      description: "",
      startsAt: toDatetimeLocalValue(event.startsAt),
      endsAt: toDatetimeLocalValue(event.endsAt),
      proofClosesAt: "",
      distances: event.distances.join(", "),
      priceInr: String(Math.round(event.priceInPaise / 100)),
      paymentRequired: event.paymentRequired,
      medalIncluded: event.medalIncluded,
      featured: event.featured,
      maxCapacity: event.maxCapacity != null ? String(event.maxCapacity) : "",
      city: event.city ?? "Virtual",
      status: event.status,
    });
    // load full event for description + proofClosesAt
    void (async () => {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: EventRow & { description: string; proofClosesAt: string } }>(
        `/api/admin/events/${event.id}`,
        token,
      );
      setForm((prev) => ({
        ...prev,
        description: json.data.description,
        proofClosesAt: toDatetimeLocalValue(json.data.proofClosesAt),
      }));
    })();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = await getToken().catch(() => null);
      const priceInPaise = Math.round(Number(form.priceInr || 0) * 100);
      const body = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description.trim() || `${form.title} virtual running event.`,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        proofClosesAt: new Date(form.proofClosesAt || form.endsAt).toISOString(),
        distances: form.distances
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        priceInPaise,
        paymentRequired: form.paymentRequired && priceInPaise > 0,
        medalIncluded: form.medalIncluded,
        featured: form.featured,
        maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null,
        city: form.city || "Virtual",
        status: form.status,
      };

      if (editingId) {
        await adminFetch(`/api/admin/events/${editingId}`, token, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setMessage("Event updated.");
      } else {
        await adminFetch("/api/admin/events", token, {
          method: "POST",
          body: JSON.stringify(body),
        });
        setMessage("Event created.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: string) {
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/events/${id}`, token, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed");
    }
  }

  async function removeEvent(id: string) {
    if (!window.confirm("Delete this event? Only works if it has zero registrations.")) {
      return;
    }
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/events/${id}`, token, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Operations"
        title="Events"
        description="Schedule, price, open/close, free entry, and capacity."
        actions={
          editingId ? (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              type="button"
            >
              Cancel edit
            </button>
          ) : null
        }
      />

      {error ? <p className="admin-muted" style={{ color: "var(--admin-danger)" }}>{error}</p> : null}
      {message ? <p className="admin-muted">{message}</p> : null}

      <div className="admin-layout-split is-form-list admin-fill">
        <form className="admin-panel admin-panel-pad space-y-4" onSubmit={onSubmit}>
          <h2 className="admin-panel-title">{editingId ? "Edit event" : "New event"}</h2>

          {/* Title — slug auto-generated, shown read-only */}
          <label className="block text-sm">
            <span className="field-label">Event title *</span>
            <input
              className="input"
              placeholder="e.g. Monsoon Mountain Miles"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                  slug: slugify(e.target.value),
                }))
              }
              required
              value={form.title}
            />
          </label>

          {/* Description */}
          <label className="block text-sm">
            <span className="field-label">Description</span>
            <textarea
              className="input min-h-20 py-2"
              placeholder="Briefly describe this event for runners…"
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              value={form.description}
            />
          </label>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="field-label">Event starts *</span>
              <input
                className="input"
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                required
                type="datetime-local"
                value={form.startsAt}
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">Event ends *</span>
              <input
                className="input"
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                required
                type="datetime-local"
                value={form.endsAt}
              />
            </label>
          </div>

          {/* Distances */}
          <label className="block text-sm">
            <span className="field-label">Distances (comma-separated) *</span>
            <input
              className="input"
              onChange={(e) => setForm((f) => ({ ...f, distances: e.target.value }))}
              placeholder="5 km, 10 km, 21 km"
              required
              value={form.distances}
            />
          </label>

          {/* Price + Status */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="field-label">Entry fee (₹)</span>
              <input
                className="input"
                inputMode="numeric"
                placeholder="499"
                onChange={(e) => setForm((f) => ({ ...f, priceInr: e.target.value }))}
                value={form.priceInr}
              />
            </label>
            <label className="block text-sm">
              <span className="field-label">Status</span>
              <select
                className="input"
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                value={form.status}
              >
                {[
                  ["DRAFT", "Draft (not visible)"],
                  ["OPEN", "Open (accepting registrations)"],
                  ["CLOSED", "Closed"],
                  ["COMPLETED", "Completed"],
                  ["CANCELLED", "Cancelled"],
                ].map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Options */}
          <div className="rounded-xl border border-(--admin-line) bg-(--admin-surface-2) p-3 space-y-2.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--admin-muted) mb-1">Options</p>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                checked={form.paymentRequired}
                onChange={(e) => setForm((f) => ({ ...f, paymentRequired: e.target.checked }))}
                type="checkbox"
              />
              <span>Payment required <span className="text-xs text-(--admin-muted)">(uncheck for free events)</span></span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                checked={form.medalIncluded}
                onChange={(e) => setForm((f) => ({ ...f, medalIncluded: e.target.checked }))}
                type="checkbox"
              />
              <span>Medal included in kit</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                type="checkbox"
              />
              <span>Featured on homepage</span>
            </label>
          </div>

          <button className="btn btn-primary btn-full" disabled={saving} type="submit">
            {saving ? "Saving…" : editingId ? "Update event" : "Create event"}
          </button>

          {/* Slug shown as read-only info */}
          {form.slug ? (
            <p className="text-xs text-(--admin-muted)">URL slug: <code className="bg-(--admin-surface-3) px-1 rounded text-[0.7rem]">{form.slug}</code></p>
          ) : null}
        </form>

        <div className="admin-stack">
          {items.map((event) => (
            <article className="admin-panel admin-panel-pad" key={event.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight">{event.title}</h2>
                    <span className="badge">{event.status}</span>
                    {!event.paymentRequired || event.priceInPaise === 0 ? (
                      <span className="badge badge-sage">Free</span>
                    ) : null}
                    {event.featured ? <span className="badge badge-solid">Featured</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {event.distances.join(" / ")} · {formatInrFromPaise(event.priceInPaise)} ·{" "}
                    {event._count?.registrations ?? 0} regs
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-soft)]">
                    {formatDateTime(event.startsAt)} → {formatDateTime(event.endsAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-secondary h-9 px-3" onClick={() => startEdit(event)} type="button">
                    Edit
                  </button>
                  {event.status !== "OPEN" ? (
                    <button
                      className="btn btn-primary h-9 px-3"
                      onClick={() => void setStatus(event.id, "OPEN")}
                      type="button"
                    >
                      Open
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary h-9 px-3"
                      onClick={() => void setStatus(event.id, "CLOSED")}
                      type="button"
                    >
                      Close
                    </button>
                  )}
                  <button
                    className="btn btn-ghost h-9 px-3 text-[var(--danger)]"
                    onClick={() => void removeEvent(event.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">
                <Link className="underline-offset-2 hover:underline" href={`/events/${event.slug}`}>
                  Public page
                </Link>
                {" · "}
                slug: {event.slug}
              </p>
            </article>
          ))}
          {items.length === 0 ? (
            <div className="admin-panel admin-panel-pad">
              <AdminEmpty>No events yet. Create one on the left.</AdminEmpty>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
