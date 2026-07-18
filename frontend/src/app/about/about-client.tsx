"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Award,
  ChevronDown,
  HeartPulse,
  MapPinned,
  Mountain,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  aboutFaqs,
  aboutFeatures,
  aboutSponsors,
  aboutStats,
  aboutTeam,
  aboutTestimonials,
  aboutTimeline,
  aboutValues,
} from "../data/about";
import { Reveal, Stagger, StaggerItem } from "../components/marketing/motion";
import {
  MarketingContainer,
  MarketingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "../components/marketing/section";
import { cn } from "../../lib/cn";

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

function Counter({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const count = useCountUp(value, inView);

  return (
    <div
      className="flex h-full min-h-[7.5rem] flex-col justify-center rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6"
      ref={ref}
    >
      <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {count.toLocaleString("en-IN")}+
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}

const valueIcons = [Mountain, Users, ShieldCheck, MapPinned, HeartPulse, Award];
const featureIcons = [ShieldCheck, MapPinned, Award, Users, HeartPulse, Mountain];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--line)]">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="text-base font-medium tracking-tight text-[var(--foreground)]">{q}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[var(--muted)] transition duration-300",
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
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="pb-5 pr-8 text-sm leading-7 text-[var(--muted)]">{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % aboutTestimonials.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  const item = aboutTestimonials[index];

  return (
    <div className="relative h-full min-h-[18rem] overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] sm:p-8">
      <AnimatePresence mode="wait">
        <motion.figure
          key={item.name}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="flex h-full flex-col"
        >
          <blockquote className="text-lg font-medium tracking-tight text-[var(--foreground)] sm:text-xl sm:leading-snug">
            “{item.quote}”
          </blockquote>
          <figcaption className="mt-auto pt-8">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.role}</p>
          </figcaption>
        </motion.figure>
      </AnimatePresence>
      <div className="mt-6 flex gap-2">
        {aboutTestimonials.map((t, i) => (
          <button
            aria-label={`Show testimonial from ${t.name}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-8 bg-[var(--foreground)]" : "w-3 bg-[var(--line)]",
            )}
            key={t.name}
            onClick={() => setIndex(i)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

export function AboutClient() {
  const reduce = useReducedMotion();
  const { isSignedIn } = useAuth();

  return (
    <>
      {/* Clean text hero — no photo banner */}
      <MarketingSection className="border-b border-[var(--line)] pt-12 sm:pt-16" tone="white">
        <MarketingContainer>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionEyebrow>About</SectionEyebrow>
            <SectionTitle className="max-w-3xl">
              Virtual runs with clear rules, real verification, and rewards that arrive.
            </SectionTitle>
            <SectionLead>
              Mountain Run organises premium virtual events for runners across India — register,
              finish on your schedule, upload GPS proof, and collect rankings, certificates, and
              medals.
            </SectionLead>
            <div className="mt-8 flex flex-wrap gap-3">
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
          </motion.div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection tone="soft">
        <MarketingContainer>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            <Reveal>
              <SectionEyebrow>Mission</SectionEyebrow>
              <SectionTitle className="text-2xl sm:text-3xl">
                Make virtual racing feel trustworthy.
              </SectionTitle>
              <SectionLead>
                From registration to proof review and fulfilment, every step should be clear —
                so the hard part is only the run.
              </SectionLead>
            </Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Mission",
                  text: "Open verified virtual events to anyone with shoes and a GPS app.",
                },
                {
                  title: "Vision",
                  text: "Be India’s most trusted home for premium virtual racing series.",
                },
              ].map((card) => (
                <StaggerItem key={card.title}>
                  <div className="flex h-full min-h-[10rem] flex-col rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sage)]">
                      {card.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{card.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Timeline — stacked cards, even layout */}
      <MarketingSection tone="white">
        <MarketingContainer className="max-w-3xl">
          <Reveal>
            <SectionEyebrow>Timeline</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">How we got here</SectionTitle>
          </Reveal>
          <div className="mt-10 space-y-4">
            {aboutTimeline.map((item, index) => (
              <Reveal delay={index * 0.03} key={item.year}>
                <article className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)]/60 p-5 sm:grid-cols-[5.5rem_1fr] sm:gap-6 sm:p-6">
                  <p className="text-sm font-semibold tabular-nums text-[var(--sage)]">
                    {item.year}
                  </p>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Values — equal height grid */}
      <MarketingSection tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Values</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">What we optimise for</SectionTitle>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutValues.map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length];
              return (
                <StaggerItem key={value.title}>
                  <article className="flex h-full min-h-[12.5rem] flex-col rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] transition hover:border-[var(--sage)]/20 hover:shadow-[var(--shadow-hover)] sm:p-6">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] text-[var(--sage)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold tracking-tight">{value.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{value.text}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </MarketingContainer>
      </MarketingSection>

      {/* Team — no photos, even cards */}
      <MarketingSection tone="white">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Team</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">People behind the series</SectionTitle>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutTeam.map((member) => (
              <StaggerItem key={member.name}>
                <article className="flex h-full min-h-[13rem] flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)]/50 p-5 sm:p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-semibold text-[var(--foreground)] shadow-sm">
                    {member.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{member.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--sage)]">
                    {member.role}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">{member.bio}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Impact</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">By the numbers</SectionTitle>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {aboutStats.map((stat) => (
              <Counter key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection tone="white">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Why Mountain Run</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">What is solid by design</SectionTitle>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutFeatures.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <StaggerItem key={feature.title}>
                  <div className="flex h-full min-h-[9.5rem] gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)]/40 p-5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[var(--sage)] shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{feature.text}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </MarketingContainer>
      </MarketingSection>

      {/* Partners — simple grid, no fake infinite image marquee feel */}
      <MarketingSection tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Partners</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">Support for the series</SectionTitle>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {aboutSponsors.map((name) => (
              <div
                className="flex min-h-[4.5rem] items-center justify-center rounded-2xl border border-[var(--line)] bg-white px-4 text-center text-sm font-semibold tracking-tight text-[var(--muted)]"
                key={name}
              >
                {name}
              </div>
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection tone="white">
        <MarketingContainer>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
            <Reveal>
              <SectionEyebrow>Runners</SectionEyebrow>
              <SectionTitle className="text-2xl sm:text-3xl">From the finish</SectionTitle>
              <SectionLead>
                Short notes from people who registered, ran, and got verified.
              </SectionLead>
            </Reveal>
            <TestimonialCarousel />
          </div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection tone="soft">
        <MarketingContainer className="max-w-3xl">
          <Reveal>
            <SectionEyebrow>FAQ</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">Common questions</SectionTitle>
          </Reveal>
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white px-5 shadow-[var(--shadow)] sm:px-6">
            {aboutFaqs.map((item) => (
              <FaqItem a={item.a} key={item.q} q={item.q} />
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--line)]" tone="white">
        <MarketingContainer className="text-center">
          <Reveal>
            <SectionEyebrow>Start</SectionEyebrow>
            <SectionTitle className="mx-auto max-w-2xl text-2xl sm:text-3xl">
              Ready for the next event window?
            </SectionTitle>
            <SectionLead className="mx-auto">
              Pick a distance, run on your schedule, upload proof, claim your result.
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
                  <Link className="btn btn-secondary rounded-xl px-6" href="/gallery">
                    View gallery
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </MarketingContainer>
      </MarketingSection>
    </>
  );
}
