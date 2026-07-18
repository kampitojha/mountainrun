"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { galleryMoments } from "../data/events";
import { fetchHomeContent, type HomeMoment } from "../../lib/events-api";
import { HomeSectionHeader } from "./home-section-header";
import { Stagger, StaggerItem } from "./marketing/motion";

const galleryTones = [
  "from-[#fef3c7] via-[#fde68a] to-[#f5f5f4]",
  "from-[#ecfdf5] via-[#d1fae5] to-[#f5f5f4]",
  "from-[#fff7ed] via-[#ffedd5] to-[#f5f5f4]",
  "from-[#eff6ff] via-[#dbeafe] to-[#f5f5f4]",
];

const fallbackMoments: HomeMoment[] = galleryMoments.map((m, i) => ({
  id: `static-${i}`,
  title: m.title,
  meta: m.meta,
  image: m.image,
}));

export function HomeGalleryPreview({
  moments: initial,
}: {
  moments?: HomeMoment[];
}) {
  const [moments, setMoments] = useState<HomeMoment[]>(
    initial && initial.length > 0 ? initial : fallbackMoments,
  );

  useEffect(() => {
    let cancelled = false;
    void fetchHomeContent().then((data) => {
      if (!cancelled && data.moments.length > 0) {
        setMoments(data.moments.slice(0, 4));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (moments.length === 0) {
    return null;
  }

  return (
    <section
      className="section border-b border-(--line) relative overflow-hidden"
      style={{
        background:
          "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.03) 0px, transparent 65%), radial-gradient(at 100% 100%, rgba(13, 148, 136, 0.04) 0px, transparent 65%), var(--background)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-10 h-80 w-80 rounded-full bg-indigo-500/3 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/3 right-10 h-80 w-80 rounded-full bg-emerald-500/4 blur-3xl pointer-events-none"
      />

      <div className="container-page relative z-10">
        <HomeSectionHeader
          action={
            <Link className="btn btn-secondary group w-full sm:w-auto" href="/gallery">
              Open gallery
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          }
          align="split"
          eyebrow="Moments of glory"
          title="Finish-line stories"
        />

        <Stagger className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
          {moments.map((moment, index) => (
            <StaggerItem key={moment.id ?? `${moment.title}-${index}`}>
              <Link
                className="gallery-card card-premium-glow group block overflow-hidden border border-(--line) rounded-(--radius) bg-(--panel-glass) backdrop-blur-md shadow-xs transition-all duration-300 hover:bg-(--panel) hover:border-(--line-strong) hover:shadow-md hover:-translate-y-1"
                href="/gallery"
              >
                <div
                  className={`gallery-card-media bg-linear-to-br ${galleryTones[index % galleryTones.length]} relative aspect-4/3 overflow-hidden`}
                >
                  <Image
                    alt={moment.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                    src={moment.image}
                    width={400}
                    height={300}
                    loading="lazy"
                  />
                  <span className="absolute left-3.5 bottom-3.5 z-10 rounded-full border border-white/20 bg-(--panel-glass-strong) px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-(--foreground) backdrop-blur-md shadow-xs">
                    {moment.meta}
                  </span>
                </div>
                <div className="p-4 bg-transparent">
                  <h3 className="text-sm font-bold text-(--foreground) transition-colors duration-300 group-hover:text-(--sage)">
                    {moment.title}
                  </h3>
                  <p className="mt-1 text-xs text-(--muted-soft) font-medium">{moment.meta}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
