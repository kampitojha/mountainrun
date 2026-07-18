"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  galleryCategories,
  galleryItems,
  galleryStats,
  type GalleryCategory,
  type GalleryItem,
} from "../data/gallery";
import { Reveal, Stagger, StaggerItem } from "../components/marketing/motion";
import {
  MarketingContainer,
  MarketingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "../components/marketing/section";
import { cn } from "../../lib/cn";

function useCountUp(target: number, active: boolean, duration = 1200) {
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

function StatCard({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useCountUp(value, inView);

  return (
    <div
      className="rounded-2xl border border-[var(--line)] bg-(--panel) p-5 shadow-[var(--shadow)] sm:p-6"
      ref={ref}
    >
      <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {count.toLocaleString("en-IN")}
        {value >= 100 ? "+" : ""}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}

function MomentCard({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <StaggerItem>
      <motion.button
        className={cn(
          "group flex h-full min-h-[17.5rem] w-full flex-col rounded-2xl border border-[var(--line)] bg-(--panel) p-5 text-left shadow-[var(--shadow)]",
          "transition hover:border-[var(--sage)]/25 hover:shadow-[var(--shadow-hover)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20",
        )}
        onClick={() => onOpen(item)}
        type="button"
        whileHover={reduce ? undefined : { y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[var(--sage-soft)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--sage)]">
            {item.category}
          </span>
          <span className="text-xs text-[var(--muted-soft)]">{item.date}</span>
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.note}</p>

        <div className="mt-auto border-t border-[var(--line)] pt-4">
          <p className="text-sm font-medium text-[var(--foreground)]">{item.event}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {item.location} · {item.photographer}
          </p>
        </div>
      </motion.button>
    </StaggerItem>
  );
}

function DetailModal({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
      aria-modal
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-3xl border border-[var(--line)] bg-(--panel) p-6 shadow-2xl sm:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[var(--sage-soft)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--sage)]">
            {item.category}
          </span>
          <button
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:bg-[var(--panel-soft)]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">{item.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.note}</p>
        <dl className="mt-6 space-y-3 text-sm">
          {[
            ["Event", item.event],
            ["Location", item.location],
            ["Date", item.date],
            ["Credited to", item.photographer],
          ].map(([label, value]) => (
            <div
              className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-3"
              key={label}
            >
              <dt className="text-[var(--muted)]">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <Link className="btn btn-primary mt-6 w-full rounded-xl" href="/events">
          Browse related events
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function GalleryClient() {
  const [category, setCategory] = useState<GalleryCategory>("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const { isSignedIn } = useAuth();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return galleryItems.filter((item) => {
      const catOk = category === "All" || item.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [item.title, item.event, item.location, item.photographer, item.category, item.note]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [category, query]);

  const featured = useMemo(() => galleryItems.filter((item) => item.featured), []);

  return (
    <>
      <MarketingSection className="pt-10 sm:pt-14" tone="white">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Gallery</SectionEyebrow>
            <SectionTitle>Moments from the series</SectionTitle>
            <SectionLead>
              Clean highlights from finishes, clubs, awards, and training — no clutter, just the
              story of each effort.
            </SectionLead>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {galleryStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection className="pt-4 sm:pt-6" tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Featured</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">Standout chapters</SectionTitle>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <MomentCard item={item} key={item.id} onOpen={setActive} />
            ))}
          </Stagger>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection id="gallery-grid" tone="white">
        <MarketingContainer wide>
          <Reveal>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <SectionEyebrow>Archive</SectionEyebrow>
                <SectionTitle className="text-2xl sm:text-3xl">Browse all moments</SectionTitle>
                <SectionLead>Filter by category or search events and places.</SectionLead>
              </div>
              <label className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  className="input h-11 rounded-xl border-[var(--line)] bg-(--panel) pl-10"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  type="search"
                  value={query}
                />
              </label>
            </div>
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-2">
            {galleryCategories.map((cat) => {
              const activePill = category === cat;
              return (
                <button
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                    activePill
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                      : "border-[var(--line)] bg-(--panel) text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                  key={cat}
                  onClick={() => setCategory(cat)}
                  type="button"
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-[var(--muted)]">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-soft)] px-6 py-14 text-center">
              <p className="font-medium">No matches</p>
              <button
                className="btn btn-secondary mt-5"
                onClick={() => {
                  setCategory("All");
                  setQuery("");
                }}
                type="button"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <MomentCard item={item} key={item.id} onOpen={setActive} />
              ))}
            </Stagger>
          )}
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection tone="soft">
        <MarketingContainer className="text-center">
          <Reveal>
            <SectionEyebrow>Next</SectionEyebrow>
            <SectionTitle className="mx-auto text-2xl sm:text-3xl">
              Add your own verified finish
            </SectionTitle>
            <SectionLead className="mx-auto">
              Register, run, upload proof — your result joins the leaderboard.
            </SectionLead>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {isSignedIn ? (
                <>
                  <Link className="btn btn-primary rounded-xl px-6" href="/dashboard">
                    My dashboard
                  </Link>
                  <Link className="btn btn-secondary rounded-xl px-6" href="/register">
                    Join an event
                  </Link>
                </>
              ) : (
                <>
                  <Link className="btn btn-primary rounded-xl px-6" href="/register">
                    Register now
                  </Link>
                  <Link className="btn btn-secondary rounded-xl px-6" href="/events">
                    Browse events
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </MarketingContainer>
      </MarketingSection>

      <AnimatePresence>
        {active ? <DetailModal item={active} onClose={() => setActive(null)} /> : null}
      </AnimatePresence>
    </>
  );
}
