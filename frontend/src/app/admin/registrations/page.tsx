"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { authHeaders, getApiUrl } from "../../../lib/api";
import { adminFetch, formatDateTime, formatInrFromPaise } from "../../../lib/admin-api";
import { AdminPageHeader } from "../ui";
import {
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

type Row = {
  id: string;
  bibNumber: string;
  distance: string;
  activityType?: string;
  status: string;
  proofStatus: string;
  finishTimeSeconds?: number | null;
  registeredAt: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingLine1?: string;
  shippingLine2?: string | null;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  adminNote?: string | null;
  user: { id: string; name: string; email: string; phone?: string | null };
  event: { id: string; title: string; slug?: string; distances?: string[] };
  payment?: { status: string; amountInPaise: number } | null;
};

function formatSeconds(sec?: number | null): string {
  if (!sec) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function parseTimeToSeconds(timeStr: string): number | null {
  if (!timeStr.trim()) return null;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
  return null;
}

export default function AdminRegistrationsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit Modal State
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [editName, setEditName] = useState("");
  const [editDistance, setEditDistance] = useState("");
  const [editActivityType, setEditActivityType] = useState("running");
  const [editBib, setEditBib] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Registration State
  const [deletingRow, setDeletingRow] = useState<Row | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!deletingRow) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/registrations/${deletingRow.id}`, token, {
        method: "DELETE",
      });
      setSuccessToast(`Registration ${deletingRow.bibNumber} (${deletingRow.shippingName || deletingRow.user.name}) deleted successfully from database.`);
      setDeletingRow(null);
      await load();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete registration");
    } finally {
      setDeleteLoading(false);
    }
  }

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const params = new URLSearchParams({ pageSize: "100" });
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      const json = await adminFetch<{ data: Row[]; meta: { total: number } }>(
        `/api/admin/registrations?${params}`,
        token,
      );
      setItems(json.data);
      setTotal(json.meta.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  function openEditModal(row: Row) {
    setEditingRow(row);
    setEditName(row.shippingName || row.user.name || "");
    setEditDistance(row.distance || "");
    setEditActivityType(row.activityType || "running");
    setEditBib(row.bibNumber || "");
    setEditStatus(row.status || "CONFIRMED");
    setEditPhone(row.shippingPhone || row.user.phone || "");
    setEditEmail(row.user.email || "");
    setEditTime(formatSeconds(row.finishTimeSeconds));
    setEditAddress(row.shippingLine1 || "");
    setEditCity(row.shippingCity || "");
    setEditState(row.shippingState || "");
    setEditPincode(row.shippingPincode || "");
    setEditNote(row.adminNote || "");
    setModalError(null);
  }

  function closeEditModal() {
    setEditingRow(null);
    setModalError(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRow) return;

    setSaving(true);
    setModalError(null);

    try {
      const token = await getToken().catch(() => null);
      const seconds = parseTimeToSeconds(editTime);

      const payload: any = {
        runnerName: editName.trim(),
        distance: editDistance.trim(),
        activityType: editActivityType.trim().toLowerCase(),
        bibNumber: editBib.trim().toUpperCase(),
        status: editStatus,
        phone: editPhone.trim(),
        email: editEmail.trim(),
        shippingLine1: editAddress.trim(),
        shippingCity: editCity.trim(),
        shippingState: editState.trim(),
        shippingPincode: editPincode.trim(),
        adminNote: editNote.trim(),
      };

      if (seconds !== null) {
        payload.finishTimeSeconds = seconds;
      }

      const res: any = await adminFetch(`/api/admin/registrations/${editingRow.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Update in local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingRow.id
            ? {
                ...item,
                bibNumber: res.data.bibNumber,
                distance: res.data.distance,
                activityType: res.data.activityType || editActivityType,
                status: res.data.status,
                shippingName: res.data.shippingName,
                user: {
                  ...item.user,
                  name: res.data.user.name,
                  email: res.data.user.email,
                  phone: res.data.user.phone,
                },
              }
            : item,
        ),
      );

      setSuccessToast(`✓ Updated ${res.data.shippingName} (BIB ${res.data.bibNumber}) successfully!`);
      setTimeout(() => setSuccessToast(null), 5000);
      closeEditModal();
    } catch (err: any) {
      setModalError(err.message || "Failed to update registration");
    } finally {
      setSaving(false);
    }
  }

  async function exportCsv() {
    const token = await getToken().catch(() => null);
    const response = await fetch(getApiUrl("/api/admin/registrations/export.csv"), {
      headers: authHeaders(token),
    });
    if (!response.ok) {
      setError("Export failed");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-stack space-y-5">
      <AdminPageHeader
        kicker="Operations"
        title="Registrations"
        description={`${total} total · Search runners, change distance category, correct typos in names, or open dossier.`}
        actions={
          <button className="btn btn-secondary" onClick={() => void exportCsv()} type="button">
            Export CSV
          </button>
        }
      />

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/80 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Help Card */}
      <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[var(--foreground)]">Quick Participant & Distance Corrections:</span>
            <p className="text-[var(--muted)] mt-0.5">
              Click <strong>&quot;✏️ Edit&quot;</strong> on any row to instantly change a runner&apos;s distance (e.g. 5K to 10K) or correct their name spelling without leaving this page!
            </p>
          </div>
        </div>
        <Link
          href="/admin/hub"
          className="shrink-0 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--background)] hover:bg-[var(--line)] text-emerald-400 font-semibold"
        >
          Open Hub Controls &rarr;
        </Link>
      </div>

      <div className="admin-toolbar flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted)]" />
          <input
            className="input pl-10 w-full"
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, bib number, phone..."
            value={q}
          />
        </div>
        <select className="input" onChange={(e) => setStatus(e.target.value)} value={status}>
          <option value="">All statuses</option>
          {["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-primary inline-flex items-center gap-1.5" onClick={() => void load()} type="button">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error ? <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p> : null}

      <div className="table-wrap table-scroll admin-fill rounded-2xl border border-[var(--line)]">
        <table className="table-clean min-w-[850px]">
          <thead>
            <tr>
              <th className="w-24">BIB</th>
              <th>Runner</th>
              <th>Event</th>
              <th>Distance & Activity</th>
              <th>Status</th>
              <th>Proof</th>
              <th>Pay</th>
              <th>Registered</th>
              <th className="text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-[var(--muted)]">
                  No registrations found matching your query.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--line)]/10 transition-colors">
                  <td className="font-mono text-xs font-bold text-amber-400">{row.bibNumber}</td>
                  <td className="strong">
                    <div className="font-bold text-[var(--foreground)]">{row.shippingName || row.user.name}</div>
                    <div className="text-xs font-normal text-[var(--muted)] font-mono">{row.user.email}</div>
                  </td>
                  <td className="text-xs">{row.event.title}</td>
                  <td>
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {row.distance}
                      </span>
                      {row.activityType === "cycling" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          🚴 Cycling
                        </span>
                      ) : row.activityType === "walking" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          🚶 Walking
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                          🏃 Running
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge">{row.status}</span>
                  </td>
                  <td>
                    <span className="badge">{row.proofStatus}</span>
                  </td>
                  <td className="text-xs">
                    {row.payment
                      ? `${row.payment.status} · ${formatInrFromPaise(row.payment.amountInPaise)}`
                      : "—"}
                  </td>
                  <td className="text-xs text-[var(--muted)]">{formatDateTime(row.registeredAt)}</td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-xs"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <Link
                        className="px-2 py-1 text-xs text-[var(--muted)] hover:text-white rounded border border-[var(--line)] hover:bg-[var(--line)] transition inline-flex items-center gap-1"
                        href={`/admin/registrations/${row.id}`}
                      >
                        <ExternalLink className="w-3 h-3" /> Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletingRow(row)}
                        className="px-2 py-1 text-xs text-rose-400 hover:text-white rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-600 transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Delete registration from database"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Quick Edit Modal ────────────────────────────────────── */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  BIB {editingRow.bibNumber}
                </span>
                <h3 className="font-extrabold text-base text-[var(--foreground)] mt-1">
                  Edit Participant Details & Distance
                </h3>
                <p className="text-xs text-[var(--muted)]">{editingRow.event.title}</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-[var(--muted)] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/80 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Runner Name */}
                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">
                    Participant / Runner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full name of participant"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-semibold text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-[var(--muted)]">Corrects misspelling</span>
                </div>

                {/* Distance Category */}
                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">
                    Distance Category *
                  </label>
                  {editingRow.event.distances && editingRow.event.distances.length > 0 ? (
                    <select
                      value={editDistance}
                      onChange={(e) => setEditDistance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-semibold text-[var(--foreground)] focus:border-emerald-500 outline-none"
                    >
                      {editingRow.event.distances.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={editDistance}
                      onChange={(e) => setEditDistance(e.target.value)}
                      placeholder="e.g. 5 km, 10 km, 21 km"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-semibold text-[var(--foreground)] focus:border-emerald-500 outline-none"
                    />
                  )}
                  <span className="text-[10px] text-[var(--muted)]">Change distance upon request</span>
                </div>

                {/* Activity Type */}
                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">
                    Activity Type *
                  </label>
                  <select
                    value={editActivityType}
                    onChange={(e) => setEditActivityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-semibold text-[var(--foreground)] focus:border-emerald-500 outline-none capitalize"
                  >
                    <option value="running">🏃 Running</option>
                    <option value="cycling">🚴 Cycling</option>
                    <option value="walking">🚶 Walking</option>
                  </select>
                  <span className="text-[10px] text-[var(--muted)]">Run, Cycle or Walk</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* BIB Number */}
                <div>
                  <label className="block font-bold text-[var(--muted)] mb-1">BIB Number</label>
                  <input
                    type="text"
                    required
                    value={editBib}
                    onChange={(e) => setEditBib(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-mono font-bold text-amber-400 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Registration Status */}
                <div>
                  <label className="block font-bold text-[var(--muted)] mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  >
                    <option value="CONFIRMED">CONFIRMED (Active)</option>
                    <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {/* Finish Time */}
                <div>
                  <label className="block font-bold text-[var(--muted)] mb-1">Finish Time (HH:MM:SS)</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="00:25:30"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm font-mono text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--line)]">
                {/* Email */}
                <div>
                  <label className="block font-medium text-[var(--muted)] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-medium text-[var(--muted)] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <span className="font-bold text-[var(--muted)] uppercase tracking-wider text-[10px]">
                  Shipping Address (for medal delivery)
                </span>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="House/Street address"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label className="block font-medium text-[var(--muted)] mb-1">Internal Note</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="e.g. Distance changed from 5K to 10K on user WhatsApp request"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/registrations/${editingRow.id}`}
                    target="_blank"
                    className="text-xs text-[var(--muted)] hover:text-white inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Full Dossier
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const rowToDelete = editingRow;
                      closeEditModal();
                      setDeletingRow(rowToDelete);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Registration
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-xl border border-[var(--line)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      "💾 Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      {deletingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[var(--panel)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Delete Registration?
                </h3>
                <p className="text-xs text-[var(--muted)]">Permanently remove from database</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--background)] p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">BIB Number:</span>
                <span className="font-mono font-bold text-amber-400">{deletingRow.bibNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Runner Name:</span>
                <span className="font-bold text-[var(--foreground)]">
                  {deletingRow.shippingName || deletingRow.user.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Event:</span>
                <span className="text-[var(--foreground)]">{deletingRow.event.title} ({deletingRow.distance})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Status:</span>
                <span className="badge">{deletingRow.status}</span>
              </div>
            </div>

            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl leading-relaxed">
              ⚠️ <strong>Warning:</strong> यह रजिस्ट्रेशन डेटाबेस से हमेशा के लिए डिलीट हो जाएगा। इससे जुड़े Payment, Proof, Certificate और Medal Delivery के सारे रिकॉर्ड्स भी हमेशा के लिए हट जाएंगे।
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/80 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setDeletingRow(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--line)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => void handleConfirmDelete()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Yes, Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
