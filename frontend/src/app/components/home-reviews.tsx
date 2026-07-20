"use client";

import Link from "next/link";
import { ArrowUpRight, Star, Quote } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHomeContent, type HomeTestimonial } from "../../lib/events-api";
import { HomeSectionHeader } from "./home-section-header";

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-3 w-3 ${i < rating ? "fill-(--sage) text-(--sage)" : "fill-(--line-strong) text-(--line-strong)"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, index, className = "" }: { review: HomeTestimonial; index: number; className?: string }) {
  return (
    <article className={`relative flex w-[280px] shrink-0 flex-col rounded-2xl border border-(--line) bg-(--panel) p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-80 sm:p-6 ${className}`}>
      {/* Left accent bar */}
      <span aria-hidden="true" className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-(--sage) opacity-40" />

      <div className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--sage-soft) text-sm font-bold text-(--sage)">
          {review.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
        </span>
        <StarRating rating={review.rating} />
      </div>

      <h3 className="mt-4 text-sm font-bold tracking-tight text-(--foreground)">
        {review.name}
      </h3>
      <p className="text-xs text-(--muted-soft)">
        {review.role}{review.city ? <span className="text-(--muted-soft)"> &middot; {review.city}</span> : null}
      </p>

      <blockquote className="mt-4 text-sm leading-relaxed text-(--muted) relative">
        <Quote aria-hidden="true" className="absolute -top-1 left-0 h-5 w-5 text-(--sage) opacity-20" />
        <span className="relative z-10 block">&ldquo;{review.quote}&rdquo;</span>
      </blockquote>
    </article>
  );
}

function MobileScroll({ reviews }: { reviews: HomeTestimonial[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / reviews.length));
    setActiveIndex(Math.min(idx, reviews.length - 1));
  }, [reviews.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="md:hidden mt-8">
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
        {reviews.map((review, i) => (
          <div key={review.id ?? i} className="snap-start shrink-0">
            <ReviewCard review={review} index={i} />
          </div>
        ))}
        {/* Peek end spacer */}
        <div className="w-4 shrink-0" />
      </div>
      {/* Dots */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to review ${i + 1}`}
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const card = el.children[i] as HTMLElement | undefined;
                if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex ? "w-5 bg-(--sage)" : "w-1.5 bg-(--line-strong) hover:bg-(--muted-soft)"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopMarquee({ reviews }: { reviews: HomeTestimonial[] }) {
  const doubled = [...reviews, ...reviews];

  return (
    <div
      className="hidden md:block relative w-full overflow-hidden mt-10"
      style={{
        maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .marquee-track {
              display: flex;
              gap: 1rem;
              width: max-content;
              animation: marquee 40s linear infinite;
              will-change: transform;
              transform: translate3d(0, 0, 0);
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
          `,
        }}
      />
      <div className="marquee-track pb-2">
        {doubled.map((review, i) => (
          <ReviewCard key={`r-${i}`} review={review} index={i % reviews.length} />
        ))}
      </div>
    </div>
  );
}

export function HomeReviews() {
  const [reviews, setReviews] = useState<HomeTestimonial[]>(fallbackReviews);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchHomeContent().then((data) => {
      if (!cancelled && data.testimonials.length > 0) {
        setReviews(data.testimonials);
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  if (!loaded && reviews.length === 0) return null;

  return (
    <section className="section overflow-hidden border-b border-(--line) relative">
      {/* Background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(at 0% 0%, color-mix(in srgb, var(--sage) 4%, transparent) 0px, transparent 60%), radial-gradient(at 100% 100%, color-mix(in srgb, var(--sage) 3%, transparent) 0px, transparent 60%)",
        }}
      />

      <div className="container-page relative z-10">
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

        {/* Mobile: horizontal scroll with dots */}
        <MobileScroll reviews={reviews} />

        {/* Desktop: auto-scroll marquee */}
        <DesktopMarquee reviews={reviews} />
      </div>
    </section>
  );
}
