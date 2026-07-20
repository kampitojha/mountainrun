"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronDown, MapPin, Medal, Route, ShieldCheck, Trophy, Upload, UserCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { aboutFaqs, aboutPillars, aboutStats, aboutSteps } from "../data/about";
import { cn } from "../../lib/cn";

/* ── Count-up animation ─────────────────────────────────── */
function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1200);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return value;
}

/* ── Stat card ─────────────────────────────────────────── */
function StatCard({ label, value, suffix = "+" }: { label: string; value: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useCountUp(value, inView);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-(--panel) px-4 py-6 text-center">
      <p className="text-3xl font-bold tracking-tight tabular-nums text-(--foreground) sm:text-4xl">
        {count.toLocaleString("en-IN")}{suffix}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-(--muted)">{label}</p>
    </div>
  );
}

/* ── FAQ accordion ─────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-(--line) last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-(--foreground) sm:text-base">{q}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-(--muted) transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="pb-5 text-sm leading-7 text-(--muted) sm:pr-10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const pillarIcons = [ShieldCheck, MapPin, Route] as const;
const stepIcons = [UserCheck, Trophy, Upload, Medal] as const;

/* ── Main component ─────────────────────────────────────── */
export function AboutClient() {
  const reduce = useReducedMotion();
  const { isSignedIn } = useAuth();

  return (
    <div className="min-w-0">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 10% 0%, color-mix(in srgb, var(--sage) 10%, transparent), transparent 55%), var(--background)",
          }}
        />
        <div className="container-page py-14 sm:py-20 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Left */}
            <motion.div
              className="min-w-0"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow">About Mountain Run</p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl">
                Real races.<br />
                <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">
                  Run anywhere.
                </span>
              </h1>
              <p className="lede mt-5 max-w-lg">
                Mountain Run is a virtual running platform for Indian runners. Register, run in your city, upload GPS proof, and earn a verified finish — certificate, leaderboard rank, and medal.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn btn-primary" href="/events">Browse open events</Link>
                {isSignedIn ? (
                  <Link className="btn btn-secondary" href="/dashboard">My dashboard</Link>
                ) : (
                  <Link className="btn btn-secondary" href="/sign-up">Create free account</Link>
                )}
              </div>
            </motion.div>

            {/* Right — image */}
            <motion.div
              className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-(--line) lg:max-w-none"
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[4/3]">
                <Image
                  alt="Runner finishing a Mountain Run virtual event"
                  src="/images/sunrise-finish.png"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/60">How it feels</p>
                  <p className="mt-1 text-base font-semibold text-white sm:text-lg">Your route. Our verification. A finish that counts.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="border-b border-(--line)">
        <div className="container-page py-10 sm:py-12">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {aboutStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT THIS IS ──────────────────────────────────────── */}
      <section className="section border-b border-(--line)">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What this is</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
              A full virtual race experience
            </h2>
            <p className="lede mt-4 mx-auto max-w-lg">
              From payment to proof review to certificate email — built for one loop: finish honestly, get recognised.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {aboutPillars.map((item, i) => {
              const Icon = pillarIcons[i % pillarIcons.length];
              return (
                <article key={item.title} className="flex flex-col rounded-2xl border border-(--line) bg-(--panel) p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-(--line) text-(--sage)">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 text-base font-bold tracking-tight text-(--foreground)">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="section border-b border-(--line) bg-(--panel-soft)/50">
        <div className="container-page">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
            Four steps. No guesswork.
          </h2>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {aboutSteps.map((item, i) => {
              const Icon = stepIcons[i % stepIcons.length];
              return (
                <li key={item.step} className="flex flex-col rounded-2xl border border-(--line) bg-(--panel) p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--panel-soft) border border-(--line) text-(--sage)">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-2xl font-bold text-(--line-strong)">{item.step}</span>
                  </div>
                  <h3 className="mt-5 text-base font-bold tracking-tight text-(--foreground)">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">{item.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── REWARDS ───────────────────────────────────────────── */}
      <section className="section border-b border-(--line)">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

            <div className="relative overflow-hidden rounded-3xl border border-(--line)">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  alt="Mountain Run finisher medal"
                  src="/images/first-medal.png"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="eyebrow">After you finish</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                Proof approved → rewards unlocked
              </h2>
              <p className="lede mt-4">One GPS screenshot triggers the whole rewards chain.</p>

              <ul className="mt-8 space-y-5">
                {[
                  { icon: ShieldCheck, title: "Leaderboard rank", text: "Approved finish times rank publicly for that event and distance. Honest, verified." },
                  { icon: Medal, title: "E-certificate", text: "Generated after approval, emailed to you, verifiable by QR code online." },
                  { icon: MapPin, title: "Medal delivery", text: "When the event includes a medal, we ship to the address you saved at registration." },
                ].map((row) => (
                  <li key={row.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--sage)">
                      <row.icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold tracking-tight text-(--foreground)">{row.title}</p>
                      <p className="mt-1 text-sm leading-6 text-(--muted)">{row.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="section border-b border-(--line) bg-(--panel-soft)/50">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="eyebrow">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                Common questions
              </h2>
            </div>
            <div className="mt-10 rounded-2xl border border-(--line) bg-(--panel) px-5 sm:px-7">
              {aboutFaqs.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-(--line) bg-(--panel) px-6 py-12 text-center sm:px-12 sm:py-14">
            {/* Subtle glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5" />

            <p className="eyebrow">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
              Pick a distance. Run this week.
            </h2>
            <p className="lede mx-auto mt-4 max-w-md">
              Open events are live on the events page. Your dashboard tracks everything after you join.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="btn btn-primary" href="/events">See open events</Link>
              {isSignedIn ? (
                <Link className="btn btn-secondary" href="/dashboard">My dashboard</Link>
              ) : (
                <Link className="btn btn-secondary" href="/sign-in">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
