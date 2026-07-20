"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHomeContent, type HomeTestimonial } from "../../lib/events-api";
import { HomeSectionHeader } from "./home-section-header";

/* ─── Fallback data ─── */
const fallbackReviews: HomeTestimonial[] = [
  { name: "Aarav Sharma", role: "10 km finisher", city: "Pune", rating: 5, quote: "Registration was simple and the proof upload was clear. Getting my certificate the same week felt amazing." },
  { name: "Nisha Verma", role: "5 km beginner", city: "Mumbai", rating: 5, quote: "I liked that I could run in my own city but still feel part of an event. The medal made it truly memorable." },
  { name: "Rohan Mehta", role: "21 km finisher", city: "Delhi", rating: 5, quote: "The leaderboard gave my long run a real target. Clean experience from payment all the way to verification." },
  { name: "Priya Patel", role: "10 km finisher", city: "Ahmedabad", rating: 5, quote: "First virtual run and it exceeded expectations. The GPS verification was smooth and the certificate looks great." },
  { name: "Vikram Singh", role: "Half marathon", city: "Jaipur", rating: 4, quote: "Well organised event with timely medal delivery. Would love to see more distance options in future events." },
  { name: "Ananya Gupta", role: "5 km runner", city: "Bangalore", rating: 5, quote: "Perfect for busy schedules — ran my 5K at 6 AM before work and uploaded proof in minutes. Loved the instant digital certificate." },
  { name: "Arjun Nair", role: "Cycling 25 km", city: "Kochi", rating: 5, quote: "Great that they now include cycling too! Did the 25 km distance along the coast. Fair ranking and prompt medal dispatch." },
  { name: "Deepika Joshi", role: "Walking 10 km", city: "Dehradun", rating: 4, quote: "As a walker I finally found an event that welcomes non-runners. The pace didn't matter — just finishing felt rewarding." },
];

/* ─── Helpers ─── */
function deriveBadge(role: string): string {
  const r = role.toLowerCase();
  if (r.includes("21") || r.includes("half")) return "Elite Finisher";
  if (r.includes("10")) return "Verified Runner";
  if (r.includes("5")) return "Rising Runner";
  if (r.includes("cycling")) return "Cycling Finisher";
  if (r.includes("walk")) return "Walker Verified";
  return "Verified Runner";
}

function deriveAchievement(role: string): string {
  return role
    .replace(/^(\d+)\s*km/i, "$1K")
    .replace(/\bfinisher\b/i, "Finisher")
    .replace(/\bbeginner\b/i, "Beginner")
    .replace(/\brunner\b/i, "Runner");
}

/* ─── Trust Bar ─── */
const trustStats = [
  { value: "4.9/5", label: "Average Rating", icon: Star },
  { value: "25,000+", label: "Registered Runners", icon: null },
  { value: "98%", label: "Finish Rate", icon: null },
  { value: "1,800+", label: "Verified Reviews", icon: null },
];

function TrustBar() {
  return (
    <div className="mb-10 grid grid-cols-2 gap-3 rounded-2xl border border-(--line) bg-(--panel) p-4 shadow-sm sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-(--line) sm:p-0 sm:shadow-none sm:border-0 sm:bg-transparent">
      {trustStats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={`flex flex-col items-center gap-0.5 py-3 text-center sm:px-5 sm:py-5 ${i === 0 ? "" : ""}`}>
            <span className="flex items-center gap-1 text-xl font-black tracking-tight text-(--foreground) sm:text-2xl">
              {Icon ? <Icon className="h-4 w-4 fill-amber-400 text-amber-400 sm:h-5 sm:w-5" /> : null}
              {stat.value}
            </span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted-soft) sm:text-[0.65rem]">{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Avatar ─── */
function AvatarCircle({ name, className = "" }: { name: string; className?: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 text-white font-bold shadow-sm ring-2 ring-white/30 ${className}`}>
      {initials}
    </span>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review, index }: { review: HomeTestimonial; index: number }) {
  const badge = deriveBadge(review.role);
  const achievement = deriveAchievement(review.role);

  return (
    <article
      className="group relative flex h-full w-[85vw] shrink-0 snap-center flex-col rounded-3xl border border-(--line) bg-(--panel) p-7 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.04)] transition-transform duration-[400ms] ease-out hover:-translate-y-2 hover:border-(--sage)/20 hover:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] will-change-transform sm:w-[calc(50vw-2rem)] sm:p-8 lg:w-[calc(33.333vw-2.5rem)]"
    >
      {/* Decorative quotation mark */}
      <Quote
        aria-hidden="true"
        className="absolute top-5 left-5 h-14 w-14 text-(--sage) opacity-[0.04] transition-opacity duration-[400ms] group-hover:opacity-[0.08] sm:h-16 sm:w-16"
      />

      {/* Badge */}
      <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full border border-(--line) bg-(--background) px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-(--muted) transition-colors duration-[400ms] group-hover:border-(--sage)/20 group-hover:text-(--sage) sm:text-[0.6rem]">
        <BadgeCheck className="h-3 w-3 text-(--sage) transition-transform duration-[400ms] group-hover:scale-110" />
        {badge}
      </span>

      {/* Quote */}
      <blockquote className="relative mt-5 flex-1">
        <p className="text-base leading-[1.7] tracking-tight text-(--foreground) sm:text-lg sm:leading-[1.65]">
          &ldquo;{review.quote}&rdquo;
        </p>
      </blockquote>

      {/* Divider */}
      <div className="mt-6 h-px bg-gradient-to-r from-(--line) via-(--line) to-transparent" />

      {/* Bottom section */}
      <div className="mt-5 flex items-center gap-4">
        <AvatarCircle
          name={review.name}
          className="h-11 w-11 text-xs transition-transform duration-[400ms] group-hover:scale-105 group-hover:rotate-2 sm:h-12 sm:w-12"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold tracking-tight text-(--foreground) sm:text-base">
              {review.name}
            </span>
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-(--sage) transition-transform duration-[400ms] group-hover:scale-110" />
          </div>
          <p className="truncate text-xs text-(--muted-soft) sm:text-sm">
            {achievement}{review.city ? <span className="text-(--muted-soft)"> &middot; {review.city}</span> : null}
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm">
        <span className="tracking-[0.08em] text-amber-400">
          {"\u2605".repeat(5)}
        </span>
        <span className="font-bold tabular-nums text-(--foreground)">{review.rating}.0</span>
        <span className="text-(--muted-soft)">Rating</span>
      </div>
    </article>
  );
}

/* ─── Carousel ─── */
function ReviewCarousel({ reviews }: { reviews: HomeTestimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  /* Mouse wheel → horizontal scroll (only when track has room) */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "auto" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative">
      {/* Gradient masks at edges */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-(--background) to-transparent md:w-24" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-r from-transparent to-(--background) md:w-24" />

      {/* Scroll track */}
      <div
        ref={trackRef}
        className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 snap-x snap-proximity no-scrollbar scroll-smooth sm:-mx-6 sm:px-6 md:gap-6"
        role="list"
        aria-label="Runner testimonials"
      >
        {reviews.map((review, i) => (
          <div key={review.id ?? i} role="listitem" className="flex py-3 first:ml-0 last:mr-0">
            <ReviewCard review={review} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function HomeReviews() {
  const [reviews, setReviews] = useState<HomeTestimonial[]>(fallbackReviews);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchHomeContent().then((data) => {
      if (!cancelled && data.testimonials.length > 0) setReviews(data.testimonials);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  if (!loaded && reviews.length === 0) return null;

  return (
    <section className="section relative overflow-hidden border-b border-(--line)">
      {/* Mountain contour background pattern */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        <svg className="h-full w-full opacity-[0.025] dark:opacity-[0.04]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 250 Q180 200 360 250 T720 250 T1080 250 T1440 250" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 300 Q180 260 360 300 T720 300 T1080 300 T1440 300" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 350 Q180 310 360 350 T720 350 T1080 350 T1440 350" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 420 Q180 370 360 420 T720 420 T1080 420 T1440 420" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 480 Q180 440 360 480 T720 480 T1080 480 T1440 480" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 560 Q180 510 360 560 T720 560 T1080 560 T1440 560" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 630 Q180 590 360 630 T720 630 T1080 630 T1440 630" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 720 Q180 670 360 720 T720 720 T1080 720 T1440 720" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
          <path d="M0 800 Q180 760 360 800 T720 800 T1080 800 T1440 800" stroke="currentColor" strokeWidth="0.5" className="text-(--sage)" />
        </svg>
      </div>

      <div className="container-page relative z-10">
        <TrustBar />

        <HomeSectionHeader
          action={
            <Link className="btn btn-secondary group w-full sm:w-auto" href="/about">
              About Mountain Run
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
          align="split"
          eyebrow="Runner reviews"
          title="Experiences from the community"
        />

        <ReviewCarousel reviews={reviews} />
      </div>
    </section>
  );
}
