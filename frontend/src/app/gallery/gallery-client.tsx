"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  galleryCategories,
  galleryItems,
  galleryStats,
  type GalleryCategory,
  type GalleryItem,
} from "../data/gallery";
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

function StatPill({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const count = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className="min-w-0 rounded-2xl border border-(--line) bg-(--panel)/90 px-4 py-4 text-center shadow-(--shadow) backdrop-blur-sm sm:px-5 sm:py-5"
    >
      <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl md:text-3xl">
        {count.toLocaleString("en-IN")}
        {value >= 100 ? "+" : ""}
      </p>
      <p className="mt-1 text-[0.7rem] font-medium text-(--muted) sm:mt-1.5 sm:text-xs">{label}</p>
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
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.28), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4 }}
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
        {/* Soft gradient template so every card feels premium */}
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

export function GalleryClient() {
  const [category, setCategory] = useState<GalleryCategory>("All");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const filtered = useMemo(() => {
    if (category === "All") return galleryItems;
    return galleryItems.filter((item) => item.category === category);
  }, [category]);

  return (
    <div className="min-w-0">
      {/* Compact hero + stats only */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -20%, color-mix(in srgb, var(--sage) 14%, transparent), transparent 60%), var(--background)",
          }}
        />
        <div className="container-page py-10 sm:py-12 md:py-14">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Gallery</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
              Moments
            </h1>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-2.5 sm:mt-10 sm:gap-3 md:grid-cols-4 md:gap-4">
            {galleryStats.map((stat) => (
              <StatPill key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </section>

      {/* Filters + image grid */}
      <section className="section pt-8 sm:pt-10">
        <div className="container-page">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            {galleryCategories.map((cat) => {
              const on = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition touch-manipulation",
                    on
                      ? "border-(--accent) bg-(--accent) text-(--on-accent) shadow-xs"
                      : "border-(--line) bg-(--panel) text-(--muted) hover:border-(--line-strong) hover:text-(--foreground)",
                  )}
                >
                  {cat}
                </button>
              );
            })}
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
            <p className="mt-12 text-center text-sm text-(--muted)">No moments in this category.</p>
          ) : null}
        </div>
      </section>

      <AnimatePresence>
        {active ? <Lightbox item={active} onClose={() => setActive(null)} /> : null}
      </AnimatePresence>
    </div>
  );
}
