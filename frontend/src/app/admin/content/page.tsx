"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { authHeaders, getApiUrl } from "../../../lib/api";
import { adminFetch } from "../../../lib/admin-api";
import { AdminEmpty, AdminPageHeader, AdminPanel } from "../ui";

type MediaRow = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  location: string | null;
  eventLabel: string | null;
  dateLabel: string | null;
  meta: string | null;
  sortOrder: number;
  published: boolean;
  showInGallery: boolean;
  showOnHomeMoments: boolean;
};

type TestimonialRow = {
  id: string;
  name: string;
  role: string;
  city: string | null;
  quote: string;
  rating: number;
  sortOrder: number;
  published: boolean;
  showOnHome: boolean;
};

const emptyMedia = {
  title: "",
  imageUrl: "/images/sunrise-finish.png",
  category: "Community",
  location: "",
  eventLabel: "",
  dateLabel: "",
  meta: "",
  sortOrder: 0,
  published: true,
  showInGallery: true,
  showOnHomeMoments: false,
};

const emptyTestimonial = {
  name: "",
  role: "",
  city: "",
  quote: "",
  rating: 5,
  sortOrder: 0,
  published: true,
  showOnHome: true,
};

export default function AdminContentPage() {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<"media" | "reviews">("media");
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mediaForm, setMediaForm] = useState(emptyMedia);
  const [reviewForm, setReviewForm] = useState(emptyTestimonial);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null);
      const [m, t] = await Promise.all([
        adminFetch<{ data: MediaRow[] }>("/api/admin/content/media", token),
        adminFetch<{ data: TestimonialRow[] }>("/api/admin/content/testimonials", token),
      ]);
      setMedia(m.data);
      setTestimonials(t.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createMedia() {
    setBusy(true);
    setInfo(null);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch("/api/admin/content/media", token, {
        method: "POST",
        body: JSON.stringify({
          ...mediaForm,
          location: mediaForm.location || null,
          eventLabel: mediaForm.eventLabel || null,
          dateLabel: mediaForm.dateLabel || null,
          meta: mediaForm.meta || null,
        }),
      });
      setMediaForm(emptyMedia);
      setInfo("Photo added. Toggle Gallery / Home Moments as needed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function patchMedia(id: string, data: Partial<MediaRow>) {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/content/media/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeMedia(id: string) {
    if (!window.confirm("Delete this photo?")) return;
    setBusy(true);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/content/media/${id}`, token, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function createReview() {
    setBusy(true);
    setInfo(null);
    setError(null);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch("/api/admin/content/testimonials", token, {
        method: "POST",
        body: JSON.stringify({
          ...reviewForm,
          city: reviewForm.city || null,
        }),
      });
      setReviewForm(emptyTestimonial);
      setInfo("Review added for homepage community section.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function patchReview(id: string, data: Partial<TestimonialRow>) {
    setBusy(true);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/content/testimonials/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeReview(id: string) {
    if (!window.confirm("Delete this review?")) return;
    setBusy(true);
    try {
      const token = await getToken().catch(() => null);
      await adminFetch(`/api/admin/content/testimonials/${id}`, token, {
        method: "DELETE",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        kicker="Site content"
        title="Homepage & gallery"
        description="Control Moments of glory photos, full gallery, and community reviews. Featured open events are set on Events (Featured checkbox)."
      />

      <div className="admin-actions">
        <button
          className={`btn ${tab === "media" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("media")}
          type="button"
        >
          Photos
        </button>
        <button
          className={`btn ${tab === "reviews" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("reviews")}
          type="button"
        >
          Reviews
        </button>
      </div>

      {error ? (
        <p className="admin-muted" style={{ color: "var(--admin-danger)" }}>
          {error}
        </p>
      ) : null}
      {info ? <p className="admin-success">{info}</p> : null}

      {tab === "media" ? (
        <>
          <AdminPanel title="Add photo" subtitle="Upload from device or paste a URL">
            <div className="admin-form-grid is-2">
              {/* File upload for image */}
              <div className="col-span-full space-y-1.5">
                <span className="field-label">Upload photo</span>
                <div className="flex items-start gap-3">
                  <input
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="input cursor-pointer py-2 file:mr-3 file:rounded-full file:border-0 file:bg-(--sage) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white block w-full"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/")) {
                        alert("Only image files are allowed (PNG, JPEG, WebP, AVIF).");
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert("Image must be under 10 MB.");
                        return;
                      }
                      try {
                        const token = await getToken();
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const base64 = reader.result as string;
                          const res = await fetch(getApiUrl("/api/uploads/image"), {
                            method: "POST",
                            headers: authHeaders(token),
                            body: JSON.stringify({ file: base64, folder: "mountainrun/admin" }),
                          });
                          if (!res.ok) { alert("Upload failed. Try again."); return; }
                          const json = await res.json();
                          setMediaForm((f) => ({ ...f, imageUrl: json.data.url }));
                        };
                        reader.readAsDataURL(file);
                      } catch { alert("Upload failed. Check connection."); }
                    }}
                    type="file"
                  />
                  {mediaForm.imageUrl && !mediaForm.imageUrl.startsWith("/images/") && (
                    <button
                      className="btn btn-secondary h-9 w-9 shrink-0 flex items-center justify-center p-0 text-sm"
                      onClick={() => setMediaForm((f) => ({ ...f, imageUrl: "" }))}
                      title="Remove image"
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-[0.65rem] text-[var(--admin-muted)]">PNG, JPEG, WebP or AVIF · max 10 MB · or enter a URL below.</p>
                {mediaForm.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img alt="Preview" src={mediaForm.imageUrl} className="mt-1 h-28 w-full rounded-lg object-cover" />
                )}
              </div>
              {(
                [
                  ["title", "Title"],
                  ["imageUrl", "Image URL"],
                  ["category", "Category"],
                  ["meta", "Card subtitle / meta"],
                  ["eventLabel", "Event label"],
                  ["location", "Location"],
                  ["dateLabel", "Date label"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="field-label">{label}</span>
                  <input
                    className="input"
                    value={mediaForm[key]}
                    onChange={(e) =>
                      setMediaForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
              <label className="block">
                <span className="field-label">Sort order</span>
                <input
                  className="input"
                  type="number"
                  value={mediaForm.sortOrder}
                  onChange={(e) =>
                    setMediaForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                  }
                />
              </label>
              <div className="span-2 flex flex-wrap gap-4 text-sm">
                {(
                  [
                    ["published", "Published"],
                    ["showInGallery", "Show in gallery"],
                    ["showOnHomeMoments", "Show on home Moments"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mediaForm[key]}
                      onChange={(e) =>
                        setMediaForm((f) => ({ ...f, [key]: e.target.checked }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="span-2">
                <button
                  className="btn btn-primary"
                  disabled={busy || !mediaForm.title || !mediaForm.imageUrl}
                  onClick={() => void createMedia()}
                  type="button"
                >
                  Add photo
                </button>
              </div>
            </div>
          </AdminPanel>

          <div className="table-wrap table-scroll">
            {media.length === 0 ? (
              <div className="admin-panel-pad">
                <AdminEmpty>No photos yet.</AdminEmpty>
              </div>
            ) : (
              <table className="table-clean min-w-[900px]">
                <thead>
                  <tr>
                    {["Preview", "Title", "Gallery", "Home", "Published", "Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {media.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={`Gallery image: ${row.title || "Running event photo"}`}
                          src={row.imageUrl}
                          className="h-12 w-16 rounded-md object-cover"
                        />
                      </td>
                      <td className="strong">
                        <div>{row.title}</div>
                        <div className="admin-muted text-xs">{row.category}</div>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost h-8 px-2 text-xs"
                          disabled={busy}
                          type="button"
                          onClick={() =>
                            void patchMedia(row.id, { showInGallery: !row.showInGallery })
                          }
                        >
                          {row.showInGallery ? "On" : "Off"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost h-8 px-2 text-xs"
                          disabled={busy}
                          type="button"
                          onClick={() =>
                            void patchMedia(row.id, {
                              showOnHomeMoments: !row.showOnHomeMoments,
                            })
                          }
                        >
                          {row.showOnHomeMoments ? "On" : "Off"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost h-8 px-2 text-xs"
                          disabled={busy}
                          type="button"
                          onClick={() =>
                            void patchMedia(row.id, { published: !row.published })
                          }
                        >
                          {row.published ? "Live" : "Hidden"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary h-8 px-2 text-xs"
                          disabled={busy}
                          type="button"
                          onClick={() => void removeMedia(row.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          <AdminPanel title="Add community review" subtitle="Shows in homepage Experiences section">
            <div className="admin-form-grid is-2">
              <label className="block">
                <span className="field-label">Name</span>
                <input
                  className="input"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="field-label">Role</span>
                <input
                  className="input"
                  value={reviewForm.role}
                  onChange={(e) => setReviewForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="10 km finisher"
                />
              </label>
              <label className="block">
                <span className="field-label">City</span>
                <input
                  className="input"
                  value={reviewForm.city}
                  onChange={(e) => setReviewForm((f) => ({ ...f, city: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="field-label">Rating (1–5)</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={5}
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, rating: Number(e.target.value) || 5 }))
                  }
                />
              </label>
              <label className="block span-2">
                <span className="field-label">Quote</span>
                <textarea
                  className="input min-h-[5rem] py-2"
                  value={reviewForm.quote}
                  onChange={(e) => setReviewForm((f) => ({ ...f, quote: e.target.value }))}
                />
              </label>
              <div className="span-2 flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reviewForm.published}
                    onChange={(e) =>
                      setReviewForm((f) => ({ ...f, published: e.target.checked }))
                    }
                  />
                  Published
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reviewForm.showOnHome}
                    onChange={(e) =>
                      setReviewForm((f) => ({ ...f, showOnHome: e.target.checked }))
                    }
                  />
                  Show on home
                </label>
              </div>
              <div className="span-2">
                <button
                  className="btn btn-primary"
                  disabled={busy || !reviewForm.name || !reviewForm.quote}
                  onClick={() => void createReview()}
                  type="button"
                >
                  Add review
                </button>
              </div>
            </div>
          </AdminPanel>

          <div className="table-wrap table-scroll">
            {testimonials.length === 0 ? (
              <div className="admin-panel-pad">
                <AdminEmpty>No reviews yet.</AdminEmpty>
              </div>
            ) : (
              <table className="table-clean min-w-[720px]">
                <thead>
                  <tr>
                    {["Name", "Quote", "Home", "Live", "Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((row) => (
                    <tr key={row.id}>
                      <td className="strong">
                        <div>{row.name}</div>
                        <div className="admin-muted text-xs">
                          {row.role}
                          {row.city ? ` · ${row.city}` : ""}
                        </div>
                      </td>
                      <td className="max-w-xs truncate text-sm">{row.quote}</td>
                      <td>
                        <button
                          className="btn btn-ghost h-8 px-2 text-xs"
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void patchReview(row.id, { showOnHome: !row.showOnHome })
                          }
                        >
                          {row.showOnHome ? "On" : "Off"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost h-8 px-2 text-xs"
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void patchReview(row.id, { published: !row.published })
                          }
                        >
                          {row.published ? "Live" : "Hidden"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary h-8 px-2 text-xs"
                          type="button"
                          disabled={busy}
                          onClick={() => void removeReview(row.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
