"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { HomeSectionHeader } from "./home-section-header";

const reviews = [
  {
    name: "Aarav Sharma",
    run: "10 km finisher",
    city: "Pune",
    rating: 5,
    text: "Registration was simple and the proof upload was clear. Getting my certificate the same week felt amazing.",
  },
  {
    name: "Nisha Verma",
    run: "5 km beginner",
    city: "Mumbai",
    rating: 5,
    text: "I liked that I could run in my own city but still feel part of an event. The medal made it truly memorable.",
  },
  {
    name: "Rohan Mehta",
    run: "21 km finisher",
    city: "Delhi",
    rating: 5,
    text: "The leaderboard gave my long run a real target. Clean experience from payment all the way to verification.",
  },
  {
    name: "Priya Iyer",
    run: "10 km finisher",
    city: "Bengaluru",
    rating: 5,
    text: "Never thought a virtual event would feel this real. The certificate is beautiful and arrived super fast.",
  },
  {
    name: "Karan Joshi",
    run: "5 km beginner",
    city: "Ahmedabad",
    rating: 4,
    text: "Loved running at my own pace and still getting a proper medal at the end. Will definitely sign up again.",
  },
  {
    name: "Divya Nair",
    run: "21 km finisher",
    city: "Chennai",
    rating: 5,
    text: "The GPS verification process was seamless. My time was logged correctly and I climbed the leaderboard fast.",
  },
  {
    name: "Arjun Kapoor",
    run: "10 km team effort",
    city: "Hyderabad",
    rating: 5,
    text: "We ran as a club and the group leaderboard was a great motivator. Everyone loved the experience.",
  },
  {
    name: "Sneha Pillai",
    run: "5 km finisher",
    city: "Kolkata",
    rating: 4,
    text: "Simple to join, simple to prove. The QR certificate I shared on LinkedIn got so many reactions!",
  },
];

const avatarGradients = [
  "from-teal-500 to-emerald-400",
  "from-indigo-500 to-blue-400",
  "from-rose-500 to-orange-400",
  "from-violet-500 to-purple-400",
  "from-amber-500 to-yellow-400",
  "from-cyan-500 to-teal-400",
  "from-pink-500 to-rose-400",
  "from-green-500 to-emerald-400",
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-(--line-strong) text-(--line-strong)"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  index,
}: {
  review: (typeof reviews)[0];
  index: number;
}) {
  return (
    <article className="feature-card card-premium-glow group shrink-0 w-72 sm:w-80 p-6 bg-(--panel) flex flex-col justify-between select-none">
      <div>
        <div className="flex items-start justify-between gap-4">
          {/* Top Left: Initials Avatar in a beautiful gradient feature-icon */}
          <span
            aria-hidden="true"
            className={`feature-icon bg-linear-to-tr ${
              avatarGradients[index % avatarGradients.length]
            } text-white font-bold text-sm shadow-sm transition-transform duration-300 group-hover:scale-110`}
          >
            {review.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </span>
          {/* Top Right: Rating Stars */}
          <div className="flex items-center gap-0.5 pt-1.5">
            <StarRating rating={review.rating} />
          </div>
        </div>

        <h3 className="mt-6 text-base font-bold tracking-tight text-(--foreground) group-hover:text-(--sage) transition-colors duration-300">
          {review.name}
        </h3>
        <p className="mt-0.5 text-xs text-(--muted-soft) font-medium">
          {review.run} · {review.city}
        </p>

        <blockquote className="mt-4 text-sm leading-relaxed text-(--muted) font-normal italic relative">
          &ldquo;{review.text}&rdquo;
        </blockquote>
      </div>
    </article>
  );
}

function DesktopMarquee() {
  const doubled = [...reviews, ...reviews];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
      }}
    >
      {/* 
        We use hardware accelerated CSS keyframe animation here. 
        This completely bypasses the main JS thread and eliminates stutter/lag.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .marquee-track {
              display: flex;
              gap: 1rem;
              width: max-content;
              animation: marquee 35s linear infinite;
              will-change: transform;
              transform: translate3d(0, 0, 0);
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
            @keyframes marquee {
              0% {
                transform: translate3d(0, 0, 0);
              }
              100% {
                transform: translate3d(-50%, 0, 0);
              }
            }
          `,
        }}
      />

      <div className="marquee-track pb-4">
        {doubled.map((review, i) => (
          <ReviewCard
            key={`r-${i}`}
            review={review}
            index={i % reviews.length}
          />
        ))}
      </div>
    </div>
  );
}

export function HomeReviews() {
  const reduce = useReducedMotion();

  return (
    <section 
      className="section overflow-hidden border-b border-(--line) relative"
      style={{
        background: "radial-gradient(at 0% 0%, rgba(13, 148, 136, 0.04) 0px, transparent 65%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.03) 0px, transparent 65%), var(--background)",
      }}
    >
      {/* Decorative ambient orbs */}
      <div aria-hidden="true" className="absolute top-1/4 left-10 h-80 w-80 rounded-full bg-teal-500/3 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-1/4 right-10 h-80 w-80 rounded-full bg-indigo-500/4 blur-3xl pointer-events-none" />

      <div className="container-page relative z-10">
        <HomeSectionHeader
          action={
            <Link
              className="btn btn-secondary group w-full sm:w-auto"
              href="/about"
            >
              About Mountain Run
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          }
          align="split"
          eyebrow="Runner reviews"
          title="Experiences from the community"
        />

        {/* Mobile: native snap-scroll row centered container */}
        <div className="md:hidden mt-8">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
            {reviews.map((review, i) => (
              <div key={review.name} className="snap-start">
                <ReviewCard review={review} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: marquee strictly inside the centered container-page layout */}
        <div className="hidden md:block mt-10">
          {reduce ? (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {reviews.map((review, i) => (
                <ReviewCard key={review.name} review={review} index={i} />
              ))}
            </div>
          ) : (
            <DesktopMarquee />
          )}
        </div>
      </div>
    </section>
  );
}
