"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Camera, Heart, Loader2, MapPin, Sparkles, Trophy, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiUrl } from "../../lib/api";
import { fileToDataUrl, validateImageFile } from "../../lib/cloudinary";
import {
  galleryCategories,
  galleryItems as staticGalleryItems,
  galleryStats,
  type GalleryCategory,
  type GalleryItem,
} from "../data/gallery";
import { fetchGalleryContent } from "../../lib/events-api";
import { cn } from "../../lib/cn";

function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, target]);

  return value;
}

const statIcons = [Camera, MapPin, Sparkles, Heart] as const;

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Camera }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-(--line) bg-(--panel) px-4 py-5 text-center transition-shadow hover:shadow-sm sm:px-5 sm:py-6"
    >
      <div aria-hidden className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-(--sage)/5 blur-xl transition-all group-hover:bg-(--sage)/10" />
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage) transition-all group-hover:border-(--sage)/30 group-hover:bg-(--sage)/10">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-(--foreground) sm:text-3xl">
        {count.toLocaleString("en-IN")}
        {value >= 100 ? "+" : ""}
      </p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-(--muted) sm:text-xs">{label}</p>
    </div>
  );
}

function GalleryCard({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  onOpen: (item: GalleryItem) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(item)}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -5 }}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-(--line) bg-(--panel) text-left shadow-(--shadow)",
        "transition-[box-shadow,border-color] duration-300",
        "hover:border-(--sage)/30 hover:shadow-(--shadow-hover)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sage)/40",
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]">
        <Image
          alt={item.title}
          src={item.image}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-black/5"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/25 to-transparent"
        />

        <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md sm:top-3.5 sm:left-3.5">
          {item.category}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
          <h3 className="text-sm font-semibold tracking-tight text-white sm:text-base">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-[0.7rem] text-white/75 sm:text-xs">
            {item.event}
            <span className="mx-1.5 text-white/40">·</span>
            {item.location}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-label={item.title}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-(--panel) shadow-2xl sm:max-h-[88vh] sm:rounded-3xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
      >
        <div className="relative aspect-[16/11] w-full shrink-0 bg-black sm:aspect-[16/10]">
          <Image
            alt={item.title}
            src={item.image}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/55"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-(--sage-soft) px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-(--sage)">
              {item.category}
            </span>
            <span className="text-xs text-(--muted-soft)">{item.date}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{item.title}</h2>
          <p className="mt-1.5 text-sm text-(--muted)">
            {item.event}
            <span className="mx-1.5 text-(--muted-soft)">·</span>
            {item.location}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SubmitPhotoModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [eventLabel, setEventLabel] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    const check = validateImageFile(f);
    if (!check.valid) {
      setError(check.error ?? "Invalid file");
      return;
    }
    setFile(f);
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file || !preview) {
      setError("Please select an image");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/content/gallery/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: preview,
          name: name.trim(),
          title: title.trim(),
          eventLabel: eventLabel.trim() || null,
          location: location.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "Submission failed");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [file, preview, name, title, eventLabel, location]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, submitting]);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-label="Submit your photo"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />
      <motion.div
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-(--panel) shadow-2xl sm:max-h-[88vh] sm:rounded-3xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
      >
        <div className="flex items-center justify-between border-b border-(--line) px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {done ? "Submitted!" : "Submit your photo"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            disabled={submitting}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-(--muted) transition hover:bg-(--line) hover:text-(--foreground) disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--sage)/10">
              <Camera className="h-7 w-7 text-(--sage)" strokeWidth={1.75} />
            </div>
            <p className="text-xl font-semibold tracking-tight">Thank you!</p>
            <p className="max-w-xs text-sm text-(--muted)">
              Your photo has been submitted and is pending review. We&rsquo;ll notify you once it&rsquo;s live.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-full bg-(--sage) px-6 py-2.5 text-sm font-semibold text-(--on-accent) transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--muted)">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Singh"
                className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-4 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--sage)/50 focus:ring-2 focus:ring-(--sage)/15"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--muted)">
                Title / caption <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Conquered the 10K in Bangalore"
                className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-4 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--sage)/50 focus:ring-2 focus:ring-(--sage)/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--muted)">
                  Event name
                </label>
                <input
                  type="text"
                  value={eventLabel}
                  onChange={(e) => setEventLabel(e.target.value)}
                  placeholder="e.g. Pune Half Marathon"
                  className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-4 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--sage)/50 focus:ring-2 focus:ring-(--sage)/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--muted)">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full rounded-xl border border-(--line) bg-(--panel-soft) px-4 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--sage)/50 focus:ring-2 focus:ring-(--sage)/15"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--muted)">
                Photo <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
                  preview
                    ? "border-(--sage)/30 bg-(--sage)/5"
                    : "border-(--line) bg-(--panel-soft) hover:border-(--line-strong)",
                )}
              >
                {preview ? (
                  <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-lg">
                    <Image
                      alt="Preview"
                      src={preview}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-(--muted-soft)" strokeWidth={1.5} />
                    <p className="text-sm text-(--muted)">Tap to select a photo</p>
                    <p className="text-xs text-(--muted-soft)">JPEG · PNG · WebP · max 5 MB</p>
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={handleFile}
              />
              {preview ? (
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); setError(""); }}
                  className="mt-1.5 text-xs text-(--muted) underline transition hover:text-(--foreground)"
                >
                  Remove and choose another
                </button>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-(--sage) px-6 py-3 text-sm font-semibold text-(--on-accent) transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Submit for review"
              )}
            </button>

            <p className="text-center text-xs text-(--muted-soft)">
              Photos are reviewed before being published to the gallery.
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export function GalleryClient() {
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<GalleryCategory>("All");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(staticGalleryItems);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchGalleryContent().then((rows) => {
      if (cancelled || !rows || rows.length === 0) return;
      setItems(
        rows.map((row) => ({
          id: row.id,
          title: row.title,
          event: row.event,
          location: row.location,
          date: row.date,
          category: (row.category as GalleryItem["category"]) || "Community",
          image: row.image,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return items;
    return items.filter((item) => item.category === category);
  }, [category, items]);

  return (
    <div className="min-w-0">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div aria-hidden className="pointer-events-none absolute top-8 right-8 flex gap-1.5 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-(--sage) animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="container-page py-10 sm:py-12 md:py-14">
          <motion.div
            className="mx-auto max-w-xl text-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">Gallery</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl">
              Captured moments
            </h1>
            <p className="lede mx-auto mt-4 max-w-lg">
              Race finishes, training miles, community runs &mdash; every frame tells a story from the Mountain Run community.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-4"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {galleryStats.map((stat, i) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} icon={statIcons[i]} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FILTERS + GRID ────────────────────────────────────── */}
      <section className="section pt-8 sm:pt-10">
        <div className="container-page">
          <div className="flex items-center gap-2">
            <div className="no-scrollbar -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
              {galleryCategories.map((cat) => {
                const on = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      on
                        ? "border-(--sage) bg-(--sage) text-(--on-accent) shadow-xs"
                        : "border-(--line) bg-(--panel) text-(--muted) hover:border-(--line-strong) hover:text-(--foreground)",
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              className="shrink-0 rounded-full border border-(--sage) bg-(--sage)/10 px-4 py-2 text-sm font-medium text-(--sage) transition-all hover:bg-(--sage)/20"
            >
              <Upload className="mr-1.5 inline-block h-4 w-4" strokeWidth={2} />
              Submit your photo
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {filtered.map((item, index) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                onOpen={setActive}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <motion.div
              className="mt-16 flex flex-col items-center gap-3 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Camera className="h-10 w-10 text-(--muted-soft)" strokeWidth={1.25} />
              <p className="text-sm text-(--muted)">No moments in this category yet.</p>
            </motion.div>
          ) : null}
        </div>
      </section>

      <AnimatePresence>
        {active ? <Lightbox item={active} onClose={() => setActive(null)} /> : null}
        {showSubmit ? <SubmitPhotoModal onClose={() => setShowSubmit(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}
