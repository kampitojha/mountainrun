"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, formatDateTime } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader } from "../ui";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ExternalLink,
  ZoomIn,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { parseProofImages } from "../../../lib/proof-utils";

/* ── Toast ──────────────────────────────────────────────── */
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] max-w-sm ${
            t.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
              : t.type === "error"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/60 dark:text-red-300"
              : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : t.type === "error" ? (
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  function toast(type: Toast["type"], message: string, duration = 4500) {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }
  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }
  return { toasts, dismiss, toast };
}

/* ── Reject Modal ───────────────────────────────────────── */
function RejectModal({
  open,
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
            Reject GPS Proof
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 hover:bg-[var(--panel-soft)]"
          >
            <X className="h-4 w-4" style={{ color: "var(--muted)" }} />
          </button>
        </div>

        <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
          The participant will see this note on their dashboard and can re-submit with a clearer GPS screenshot.
        </p>

        <label className="block text-sm mb-4">
          <span className="field-label">Rejection Reason</span>
          <textarea
            className="input text-sm w-full"
            rows={3}
            placeholder="e.g. Activity screenshot is blurry / distance does not match / date is outside event window."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={busy}
            className="btn btn-danger flex-1"
          >
            {busy ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Multi-Image Lightbox Modal ─────────────────────────── */
function LightboxModal({
  images,
  initialIndex = 0,
  onClose,
}: {
  images: string[] | null;
  initialIndex?: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, images]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images, onClose]);

  if (!images || images.length === 0) return null;

  const currentUrl = images[currentIndex] || images[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-black/90 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono">
              {currentIndex + 1} / {images.length}
            </span>
            {images.length > 1 && (
              <span className="hidden sm:inline text-white/50">
                Use arrow keys or buttons to navigate
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--sage)] hover:underline flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
            >
              Open Original <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Image Display with Prev/Next Buttons */}
        <div className="relative flex-1 flex items-center justify-center p-2 min-h-[300px] max-h-[70vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt={`GPS proof screenshot ${currentIndex + 1}`}
            className="max-h-[68vh] max-w-full w-auto object-contain mx-auto select-none transition-all duration-150"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-black/90 text-white p-2.5 border border-white/20 shadow-lg cursor-pointer transition"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-black/90 text-white p-2.5 border border-white/20 shadow-lg cursor-pointer transition"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip for Multi-Images */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-black/70 border-t border-white/10 overflow-x-auto justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-12 w-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                  currentIndex === idx ? "border-[var(--sage)] scale-105" : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Types ──────────────────────────────────────────────── */
type ProofRow = {
  id: string;
  bibNumber: string;
  distance: string;
  finishTimeSeconds: number | null;
  registeredAt: string;
  user: { name: string; email: string };
  event: { title: string };
  proofUpload: {
    activityImageUrl: string;
    sourceApp: string;
    submittedAt?: string;
  } | null;
};

function formatSecondsToHms(secs: number | null | undefined) {
  if (secs == null || !Number.isFinite(secs) || secs <= 0) {
    return { h: "00", m: "00", s: "00", label: "No time entered" };
  }
  const total = Math.round(secs);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    label: h > 0 ? `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s` : `${m}m ${String(s).padStart(2, "0")}s`,
  };
}

/* ── Page ───────────────────────────────────────────────── */
export default function AdminProofsPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ProofRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, dismiss, toast } = useToast();

  // Custom verified times per proof id
  const [verifiedTimes, setVerifiedTimes] = useState<Record<string, { h: string; m: string; s: string }>>({});

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectBusy, setRejectBusy] = useState(false);

  // Lightbox modal state
  const [lightboxGallery, setLightboxGallery] = useState<{ images: string[]; initialIndex: number } | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const json = await adminFetch<{ data: ProofRow[]; meta: { total: number } }>(
        "/api/admin/proofs?status=SUBMITTED&pageSize=50",
        token,
      );
      setItems(json.data);
      setTotal(json.meta.total);

      // Initialize verifiedTimes map
      const initialMap: Record<string, { h: string; m: string; s: string }> = {};
      for (const row of json.data) {
        const parsed = formatSecondsToHms(row.finishTimeSeconds);
        initialMap[row.id] = { h: parsed.h, m: parsed.m, s: parsed.s };
      }
      setVerifiedTimes(initialMap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleTimeChange(id: string, field: "h" | "m" | "s", val: string) {
    setVerifiedTimes((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { h: "00", m: "00", s: "00" }),
        [field]: val,
      },
    }));
  }

  async function approve(id: string) {
    setBusyId(id);
    try {
      const token = await getToken().catch(() => null);
      const timeObj = verifiedTimes[id] ?? { h: "0", m: "0", s: "0" };
      const h = Math.max(0, parseInt(timeObj.h, 10) || 0);
      const m = Math.max(0, parseInt(timeObj.m, 10) || 0);
      const s = Math.max(0, parseInt(timeObj.s, 10) || 0);
      const finishTimeSeconds = (h * 3600) + (m * 60) + s;

      await adminFetch(`/api/admin/proofs/${id}/review`, token, {
        method: "POST",
        body: JSON.stringify({
          approved: true,
          finishTimeSeconds: finishTimeSeconds > 0 ? finishTimeSeconds : undefined,
        }),
      });

      const formattedLabel =
        finishTimeSeconds > 0
          ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : "verified";

      toast(
        "success",
        `🎉 Proof approved (${formattedLabel})! Certificate generated & emailed to the runner.`,
      );
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Approval failed");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string, note: string) {
    setRejectBusy(true);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/proofs/${id}/review`, token, {
        method: "POST",
        body: JSON.stringify({ approved: false, reviewerNote: note || undefined }),
      });
      toast("info", note ? `Proof rejected: "${note}"` : "Proof rejected.");
      setRejectTarget(null);
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setRejectBusy(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <RejectModal
        open={rejectTarget !== null}
        onConfirm={(note) => rejectTarget && void reject(rejectTarget, note)}
        onCancel={() => setRejectTarget(null)}
        busy={rejectBusy}
      />

      <LightboxModal
        images={lightboxGallery?.images ?? null}
        initialIndex={lightboxGallery?.initialIndex ?? 0}
        onClose={() => setLightboxGallery(null)}
      />

      <div className="admin-stack">
        <AdminPageHeader
          kicker="Operations"
          title="Proof queue"
          description={`${total} submission${total === 1 ? "" : "s"} waiting for review.`}
          actions={
            <button className="btn btn-secondary" onClick={() => void load()} type="button">
              Refresh
            </button>
          }
        />

        {error ? (
          <p className="admin-muted" style={{ color: "var(--danger)" }}>{error}</p>
        ) : null}

        <div className="admin-stack admin-fill">
          {items.length === 0 ? (
            <div className="admin-panel admin-panel-pad is-fill">
              <AdminEmpty>Queue is empty.</AdminEmpty>
            </div>
          ) : (
            items.map((row) => {
              const timeObj = verifiedTimes[row.id] ?? { h: "00", m: "00", s: "00" };
              const proofImages = parseProofImages(row.proofUpload?.activityImageUrl);

              return (
                <article
                  key={row.id}
                  className="rounded-2xl p-5 md:p-6 transition-all duration-150 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {/* Left Column: Participant & Event info + Time form + Actions */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                            style={{ background: "var(--panel-soft)", color: "var(--sage)", border: "1px solid var(--line)" }}
                          >
                            {row.bibNumber}
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(227,100,20,0.12)", color: "#c45400" }}
                          >
                            {row.distance}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            Submitted {formatDateTime(row.proofUpload?.submittedAt ?? row.registeredAt)}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold mt-1" style={{ color: "var(--foreground)" }}>
                          {row.user.name || "Unknown Runner"}
                        </h2>
                        <p className="text-xs text-[var(--muted)]">{row.user.email}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-[var(--sage)]">{row.event.title}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          App: <span className="font-semibold text-[var(--foreground)]">{row.proofUpload?.sourceApp ?? "Unknown"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Time Input Section */}
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{ background: "var(--panel-soft)", border: "1px solid var(--line)" }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--sage)]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                            Official Finish Time
                          </span>
                        </div>
                        <span className="text-[0.7rem] text-[var(--muted)]">
                          Participant entered: <strong className="text-[var(--foreground)]">{formatSecondsToHms(row.finishTimeSeconds).label}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--muted)] font-medium shrink-0">
                          Verify / Adjust Time:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              className="input text-center text-sm font-mono h-9"
                              value={timeObj.h}
                              onChange={(e) => handleTimeChange(row.id, "h", e.target.value)}
                              placeholder="00"
                            />
                            <span className="text-[0.65rem] text-[var(--muted)] block text-center mt-0.5">Hours</span>
                          </div>
                          <span className="font-bold text-sm text-[var(--muted)] pb-3">:</span>
                          <div>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              className="input text-center text-sm font-mono h-9"
                              value={timeObj.m}
                              onChange={(e) => handleTimeChange(row.id, "m", e.target.value)}
                              placeholder="00"
                            />
                            <span className="text-[0.65rem] text-[var(--muted)] block text-center mt-0.5">Mins</span>
                          </div>
                          <span className="font-bold text-sm text-[var(--muted)] pb-3">:</span>
                          <div>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              className="input text-center text-sm font-mono h-9"
                              value={timeObj.s}
                              onChange={(e) => handleTimeChange(row.id, "s", e.target.value)}
                              placeholder="00"
                            />
                            <span className="text-[0.65rem] text-[var(--muted)] block text-center mt-0.5">Secs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Actions */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        className="btn btn-primary h-10 px-5 text-sm font-semibold shadow-xs"
                        disabled={busyId === row.id}
                        onClick={() => void approve(row.id)}
                        type="button"
                        style={{ background: "linear-gradient(135deg, #1a3a2e, #0d5c45)" }}
                      >
                        {busyId === row.id ? "Approving…" : "✓ Approve & Queue Certificate"}
                      </button>
                      <button
                        className="btn btn-secondary h-10 px-4 text-sm font-semibold"
                        disabled={busyId === row.id || rejectBusy}
                        onClick={() => setRejectTarget(row.id)}
                        type="button"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Right Column: GPS Screenshots Preview with Gallery & Zoom */}
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-[var(--muted)] mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[var(--sage)]" /> 
                        Activity Proof {proofImages.length > 1 ? `(${proofImages.length} Photos)` : ""}
                      </span>
                      {proofImages.length > 0 && (
                        <span className="text-[0.7rem] text-[var(--sage)] font-medium">
                          Click to enlarge
                        </span>
                      )}
                    </p>

                    {proofImages.length > 0 ? (
                      <div className="flex flex-col gap-2 flex-1">
                        {/* Primary Image preview */}
                        <div className="relative group rounded-xl overflow-hidden border border-[var(--line)] bg-black/5 flex-1 min-h-[150px] max-h-[200px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt="GPS proof screenshot"
                            className="h-full w-full object-contain cursor-pointer transition-transform duration-200 group-hover:scale-105"
                            src={proofImages[0]}
                            onClick={() => setLightboxGallery({ images: proofImages, initialIndex: 0 })}
                          />
                          <button
                            type="button"
                            onClick={() => setLightboxGallery({ images: proofImages, initialIndex: 0 })}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold gap-1.5 cursor-pointer"
                          >
                            <ZoomIn className="h-4 w-4" /> Click to Zoom
                          </button>
                        </div>

                        {/* Multi-Photo Thumbnails */}
                        {proofImages.length > 1 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {proofImages.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setLightboxGallery({ images: proofImages, initialIndex: idx })}
                                className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-[var(--line)] hover:border-[var(--sage)] transition-all cursor-pointer group"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={`Proof ${idx + 1}`} className="h-full w-full object-cover" />
                                <span className="absolute bottom-0 right-0 bg-black/70 text-[0.6rem] text-white font-mono px-1 rounded-tl">
                                  #{idx + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid place-items-center rounded-xl border border-dashed border-[var(--line)] text-sm text-[var(--muted)] flex-1 min-h-[160px]">
                        No image uploaded
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
