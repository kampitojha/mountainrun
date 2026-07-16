"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  galleryCategories,
  galleryItems,
  galleryStats,
  type GalleryCategory,
  type GalleryItem,
} from "../data/gallery";
import { FadeIn, Reveal, Stagger, StaggerItem } from "../components/marketing/motion";
import {
  MarketingContainer,
  MarketingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "../components/marketing/section";
import { cn } from "../../lib/cn";

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
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
      className="rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-[var(--shadow)] backdrop-blur-sm sm:p-6"
      ref={ref}
    >
      <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
        {count.toLocaleString("en-IN")}
        {value >= 100 ? "+" : ""}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}

function GalleryCard({
  item,
  onOpen,
  index,
}: {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
  index: number;
}) {
  const reduce = useReducedMotion();

  return (
    <StaggerItem>
      <motion.button
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--foreground)] text-left shadow-[var(--shadow)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/30",
          item.tall ? "min-h-[22rem] sm:min-h-[26rem]" : "min-h-[16rem] sm:min-h-[18rem]",
        )}
        onClick={() => onOpen(item)}
        type="button"
        whileHover={reduce ? undefined : { y: -4 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          src={item.image}
          style={{ objectPosition: item.objectPosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 opacity-90 transition group-hover:opacity-100" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {item.category}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-1 p-5 transition duration-500 group-hover:translate-y-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
            {item.event}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-white/70">
            {item.location} · {item.date}
          </p>
          <p className="mt-1 text-xs text-white/45">Photo · {item.photographer}</p>
        </div>
        <span className="sr-only">Open photo {index + 1}</span>
      </motion.button>
    </StaggerItem>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onChange,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const item = items[index];
  const reduce = useReducedMotion();
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!items.length) return;
      onChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onChange],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  if (!item) return null;

  return (
    <motion.div
      aria-modal
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
    >
      <button
        aria-label="Close lightbox"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        type="button"
      />

      <motion.div
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0d0f] shadow-2xl lg:grid-cols-[1.3fr_0.85fr]"
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onTouchStart={(e) => {
          touchX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          if (start == null || end == null) return;
          const delta = end - start;
          if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="relative min-h-[45vh] bg-black sm:min-h-[55vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={item.id}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              src={item.image}
              style={{ objectPosition: item.objectPosition }}
              initial={reduce ? false : { opacity: 0.4, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 sm:p-4">
            <button
              aria-label="Previous"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
              onClick={() => go(-1)}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
              onClick={() => go(1)}
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col p-5 text-white sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {item.category}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{item.title}</h2>
            </div>
            <button
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-white/70">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt>Event</dt>
              <dd className="text-right font-medium text-white">{item.event}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt>Location</dt>
              <dd className="text-right font-medium text-white">{item.location}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt>Date</dt>
              <dd className="text-right font-medium text-white">{item.date}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Photographer</dt>
              <dd className="text-right font-medium text-white">{item.photographer}</dd>
            </div>
          </dl>

          <p className="mt-6 text-xs text-white/40">
            {index + 1} / {items.length} · Arrow keys or swipe to navigate
          </p>

          <div className="mt-auto flex flex-wrap gap-2 pt-8">
            <a
              className="btn btn-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm"
              download
              href={item.image}
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <a
              className="btn btn-on-dark inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm"
              href={item.image}
              rel="noreferrer"
              target="_blank"
            >
              <Maximize2 className="h-4 w-4" />
              Full size
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GalleryClient() {
  const [category, setCategory] = useState<GalleryCategory>("All");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return galleryItems.filter((item) => {
      const catOk = category === "All" || item.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [item.title, item.event, item.location, item.photographer, item.category]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [category, query]);

  const featured = useMemo(
    () => galleryItems.filter((item) => item.featured).slice(0, 3),
    [],
  );

  const activeIndex = filtered.findIndex((item) => item.id === activeId);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[78vh] overflow-hidden bg-[var(--foreground)] text-white">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="h-full w-full object-cover scale-105"
            src="/images/mountain-run-hero.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-[var(--background)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
        </div>

        <MarketingContainer className="relative flex min-h-[78vh] flex-col justify-end pb-16 pt-28 sm:pb-20">
          <FadeIn>
            <SectionEyebrow light>Gallery</SectionEyebrow>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Moments that make
              <br className="hidden sm:block" /> the finish feel real.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Ridge lines, club packs, first medals, and quiet long runs — a living archive of
              Mountain Run weekends across India.
            </p>
          </FadeIn>

          <motion.div
            aria-hidden
            className="mt-12 flex flex-col items-start gap-2 text-white/50"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
              Scroll
            </span>
            <span className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
          </motion.div>
        </MarketingContainer>
      </section>

      {/* Stats */}
      <MarketingSection className="-mt-6 pt-0 sm:-mt-8" tone="default">
        <MarketingContainer>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {galleryStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Featured */}
      <MarketingSection className="pt-8 sm:pt-10" tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Featured memories</SectionEyebrow>
            <SectionTitle>Frames we keep coming back to</SectionTitle>
            <SectionLead>
              A short cut of standout finishes, awards, and community energy from recent seasons.
            </SectionLead>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 lg:grid-cols-3">
            {featured.map((item, index) => (
              <GalleryCard
                index={index}
                item={item}
                key={item.id}
                onOpen={(photo) => setActiveId(photo.id)}
              />
            ))}
          </Stagger>
        </MarketingContainer>
      </MarketingSection>

      {/* Main gallery */}
      <MarketingSection id="gallery-grid" tone="white">
        <MarketingContainer wide>
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <SectionEyebrow>Full archive</SectionEyebrow>
                <SectionTitle>Browse every chapter</SectionTitle>
                <SectionLead>
                  Filter by vibe or search events, places, and photographers.
                </SectionLead>
              </div>
              <label className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  className="input h-11 rounded-full border-[var(--line)] bg-[var(--panel-soft)] pl-10 pr-4"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, locations, people…"
                  type="search"
                  value={query}
                />
              </label>
            </div>
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-2">
            {galleryCategories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                    active
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-white shadow-sm"
                      : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line)] hover:text-[var(--foreground)]",
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
            Showing {filtered.length} of {galleryItems.length} photos
          </p>

          {filtered.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel-soft)] px-6 py-16 text-center">
              <p className="text-base font-medium">No matches</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Try another filter or clear the search.
              </p>
              <button
                className="btn btn-secondary mt-6"
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
            <Stagger className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
              {filtered.map((item, index) => (
                <div className="mb-4 break-inside-avoid" key={item.id}>
                  <GalleryCard
                    index={index}
                    item={item}
                    onOpen={(photo) => setActiveId(photo.id)}
                  />
                </div>
              ))}
            </Stagger>
          )}
        </MarketingContainer>
      </MarketingSection>

      {/* CTA */}
      <MarketingSection tone="dark">
        <MarketingContainer className="text-center">
          <Reveal>
            <SectionEyebrow light>Your chapter next</SectionEyebrow>
            <SectionTitle className="mx-auto" light>
              Run it. Proof it. Own the memory.
            </SectionTitle>
            <SectionLead className="mx-auto" light>
              Join an open event, finish on your terms, and add your verified story to the wall.
            </SectionLead>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link className="btn btn-primary rounded-full px-6" href="/register">
                Register now
              </Link>
              <Link className="btn btn-on-dark rounded-full px-6" href="/events">
                Browse events
              </Link>
            </div>
          </Reveal>
        </MarketingContainer>
      </MarketingSection>

      <AnimatePresence>
        {activeId && activeIndex >= 0 ? (
          <Lightbox
            index={activeIndex}
            items={filtered}
            onChange={(next) => setActiveId(filtered[next]?.id ?? null)}
            onClose={() => setActiveId(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
