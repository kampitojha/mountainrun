"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronDown, MapPin, Medal, Route, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { aboutFaqs, aboutPillars, aboutStats, aboutSteps } from "../data/about";
import { cn } from "../../lib/cn";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return value;
}

function StatCard({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const count = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className="min-w-0 rounded-2xl border border-(--line) bg-(--panel) px-4 py-5 text-center shadow-(--shadow) sm:px-5 sm:py-6"
    >
      <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {count.toLocaleString("en-IN")}+
      </p>
      <p className="mt-1.5 text-xs font-medium text-(--muted) sm:text-sm">{label}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-(--line) last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 py-4 text-left sm:items-center sm:gap-4 sm:py-5"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 text-sm font-medium tracking-tight text-(--foreground) sm:text-base">
          {q}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-(--muted) transition duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="pb-4 pr-2 text-sm leading-7 text-(--muted) sm:pb-5 sm:pr-10">{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const pillarIcons = [ShieldCheck, MapPin, Route] as const;

export function AboutClient() {
  const reduce = useReducedMotion();
  const { isSignedIn } = useAuth();

  return (
    <div className="min-w-0">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 15% 0%, color-mix(in srgb, var(--sage) 12%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(99,102,241,0.06), transparent 50%), var(--background)",
          }}
        />
        <div className="container-page py-12 sm:py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              <p className="eyebrow">About Mountain Run</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
                Virtual races you can trust — run anywhere in India.
              </h1>
              <div className="mt-5 space-y-4 text-sm leading-7 text-(--muted) sm:text-base sm:leading-8">
                <p>
                  Mountain Run is a virtual running platform. You register online, run in your own
                  city within the event window, upload GPS proof, and earn a verified finish —
                  certificate, leaderboard spot, and medal when the event includes one.
                </p>
                <p>
                  We built it for runners who want a real event structure without travel: clear
                  distances, paid registration, human proof review, and a dashboard that shows
                  where everything stands.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link className="btn btn-primary w-full sm:w-auto" href="/events">
                  Browse events
                </Link>
                <Link className="btn btn-secondary w-full sm:w-auto" href="/events">
                  {isSignedIn ? "Join an event" : "Browse events"}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-(--line) shadow-(--shadow-hover) lg:max-w-none"
            >
              <div className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  alt="Mountain Run finish moment"
                  src="/images/sunrise-finish.png"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/10"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/70">
                    How it feels
                  </p>
                  <p className="mt-1.5 text-base font-semibold text-white sm:text-lg">
                    Your route. Our verification. A finish that counts.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-(--line) bg-(--panel-soft)/40">
        <div className="container-page py-8 sm:py-10">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {aboutStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </section>

      {/* What we are */}
      <section className="section border-b border-(--line)">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What this is</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              A full virtual race stack — not just a signup form
            </h2>
            <p className="mt-3 text-sm leading-7 text-(--muted) sm:text-base">
              From payment to proof review to certificate email, the product is built for one loop:
              finish honestly, get recognised.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {aboutPillars.map((item, index) => {
              const Icon = pillarIcons[index % pillarIcons.length];
              return (
                <article
                  key={item.title}
                  className="flex h-full flex-col rounded-2xl border border-(--line) bg-(--panel) p-5 shadow-(--shadow) sm:p-6"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section border-b border-(--line) bg-(--panel-soft)/30">
        <div className="container-page">
          <div className="max-w-xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Four steps. No guesswork.
            </h2>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {aboutSteps.map((item) => (
              <li
                key={item.step}
                className="relative flex h-full flex-col rounded-2xl border border-(--line) bg-(--panel) p-5 shadow-(--shadow) sm:p-6"
              >
                <span className="font-mono text-xs font-semibold tracking-wider text-(--sage)">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rewards strip */}
      <section className="section border-b border-(--line)">
        <div className="container-page">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
            <div className="relative overflow-hidden rounded-3xl border border-(--line) shadow-(--shadow)">
              <div className="relative aspect-[16/11] w-full">
                <Image
                  alt="Finisher medal"
                  src="/images/first-medal.png"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">After you finish</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Proof approved → rewards unlocked
              </h2>
              <ul className="mt-6 space-y-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Leaderboard",
                    text: "Approved finish times rank publicly for that event and distance.",
                  },
                  {
                    icon: Medal,
                    title: "E-certificate",
                    text: "Generated after approval, emailed to you, and verifiable online.",
                  },
                  {
                    icon: MapPin,
                    title: "Medal delivery",
                    text: "When the event includes a medal, shipping uses the address you saved at registration.",
                  },
                ].map((row) => (
                  <li key={row.title} className="flex gap-3 sm:gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
                      <row.icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-tight">{row.title}</p>
                      <p className="mt-1 text-sm leading-6 text-(--muted)">{row.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section border-b border-(--line) bg-(--panel-soft)/30">
        <div className="container-page max-w-3xl">
          <div className="text-center">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Straight answers
            </h2>
          </div>
          <div className="mt-8 rounded-2xl border border-(--line) bg-(--panel) px-4 shadow-(--shadow) sm:mt-10 sm:px-6">
            {aboutFaqs.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-2xl rounded-3xl border border-(--line) bg-(--panel) px-6 py-10 text-center shadow-(--shadow) sm:px-10 sm:py-12">
            <p className="eyebrow">Ready when you are</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Pick a distance. Run this week.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-(--muted)">
              Open events are on the events page. Your dashboard tracks payment, proof, and
              certificates after you join.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link className="btn btn-primary w-full sm:w-auto" href="/events">
                See open events
              </Link>
              {isSignedIn ? (
                <Link className="btn btn-secondary w-full sm:w-auto" href="/dashboard">
                  My dashboard
                </Link>
              ) : (
                <Link className="btn btn-secondary w-full sm:w-auto" href="/sign-in">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
