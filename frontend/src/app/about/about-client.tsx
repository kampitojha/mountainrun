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
      const t = Math.min(1, (now - start) / 1300);
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
      className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6"
      ref={ref}
    >
      <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
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
        <span className="text-base font-medium tracking-tight text-[var(--foreground)]">
          {q}
        </span>
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
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
    <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] sm:p-10">
      <AnimatePresence mode="wait">
        <motion.figure
          key={item.name}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-1 text-[var(--sage)]" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <blockquote className="mt-5 text-xl font-medium tracking-tight text-[var(--foreground)] sm:text-2xl sm:leading-snug">
            “{item.quote}”
          </blockquote>
          <figcaption className="mt-6">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.role}</p>
          </figcaption>
        </motion.figure>
      </AnimatePresence>
      <div className="mt-8 flex gap-2">
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

  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[85vh] overflow-hidden bg-[var(--foreground)] text-white">
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={false}
          style={{ willChange: "transform" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="h-full w-full scale-110 object-cover object-[50%_30%]"
            src="/images/mountain-run-hero.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[var(--background)]" />
        </motion.div>

        <MarketingContainer className="relative flex min-h-[85vh] flex-col justify-end pb-20 pt-32">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionEyebrow light>About Mountain Run</SectionEyebrow>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Built for runners who finish
              <span className="text-white/55"> on their own terms.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              We organise premium virtual races with verified GPS proof, public rankings, and
              rewards that arrive — so effort in any city still feels like a real event.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-primary rounded-full px-6" href="/register">
                Register now
              </Link>
              <Link className="btn btn-on-dark rounded-full px-6" href="/events">
                Explore events
              </Link>
            </div>
          </motion.div>
        </MarketingContainer>
      </section>

      {/* Mission */}
      <MarketingSection tone="white">
        <MarketingContainer>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
            <Reveal>
              <SectionEyebrow>Mission</SectionEyebrow>
              <SectionTitle>Make virtual racing feel trustworthy and worth celebrating.</SectionTitle>
              <SectionLead>
                From clean registration to proof review and medal dispatch, every step is designed
                so runners and clubs can focus on the run — not the logistics.
              </SectionLead>
            </Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Mission",
                  text: "Open verified virtual events to anyone with a pair of shoes and a GPS app.",
                },
                {
                  title: "Vision",
                  text: "Become India’s most trusted home for premium virtual mountain-inspired racing.",
                },
              ].map((card) => (
                <StaggerItem key={card.title}>
                  <div className="h-full rounded-3xl border border-[var(--line)] bg-[var(--panel-soft)]/80 p-6 shadow-[var(--shadow)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]">
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

      {/* Timeline */}
      <MarketingSection tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Our path</SectionEyebrow>
            <SectionTitle>A timeline of intentional growth</SectionTitle>
            <SectionLead>
              Not a pitch deck — the real steps from first virtual challenge to a full season.
            </SectionLead>
          </Reveal>

          <div className="relative mt-14">
            <div
              aria-hidden
              className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-[var(--line)] via-[var(--sage)]/40 to-[var(--line)] sm:left-1/2 sm:-translate-x-px"
            />
            <div className="space-y-8 sm:space-y-12">
              {aboutTimeline.map((item, index) => {
                const right = index % 2 === 1;
                return (
                  <Reveal delay={index * 0.04} key={item.year}>
                    <div
                      className={cn(
                        "relative grid gap-4 sm:grid-cols-2 sm:gap-10",
                        right && "sm:[&>*:first-child]:order-2",
                      )}
                    >
                      <div
                        className={cn(
                          "pl-12 sm:pl-0",
                          right ? "sm:pl-10" : "sm:pr-10 sm:text-right",
                        )}
                      >
                        <div className="inline-flex rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:max-w-md">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sage)]">
                              {item.year}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold tracking-tight">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                              {item.text}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block" />
                      <span className="absolute left-4 top-6 grid h-3 w-3 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-[var(--sage)] shadow sm:left-1/2" />
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Values */}
      <MarketingSection tone="white">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Values</SectionEyebrow>
            <SectionTitle>What we optimise for</SectionTitle>
            <SectionLead>
              Six principles that shape product decisions, event design, and how we treat runners.
            </SectionLead>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutValues.map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length];
              return (
                <StaggerItem key={value.title}>
                  <article className="group h-full rounded-3xl border border-[var(--line)] bg-[var(--panel-soft)]/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--sage)]/30 hover:bg-white hover:shadow-[var(--shadow-hover)]">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--line)] bg-white text-[var(--sage)] shadow-sm transition group-hover:rotate-6 group-hover:border-[var(--sage)]/25">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{value.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{value.text}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </MarketingContainer>
      </MarketingSection>

      {/* Team */}
      <MarketingSection tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Team</SectionEyebrow>
            <SectionTitle>People behind the series</SectionTitle>
            <SectionLead>
              A small crew focused on race quality, community, and operational reliability.
            </SectionLead>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutTeam.map((member) => (
              <StaggerItem key={member.name}>
                <article className="group overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]">
                  <div className="relative h-40 overflow-hidden bg-[var(--foreground)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105"
                      src="/images/mountain-run-hero.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-sm font-semibold text-white">
                      {member.name}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sage)]">
                      {member.role}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{member.bio}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </MarketingContainer>
      </MarketingSection>

      {/* Stats */}
      <MarketingSection tone="white">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Impact</SectionEyebrow>
            <SectionTitle>Numbers that reflect real finishes</SectionTitle>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {aboutStats.map((stat) => (
              <Counter key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Why */}
      <MarketingSection tone="soft">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Why Mountain Run</SectionEyebrow>
            <SectionTitle>Everything that should be solid — is solid</SectionTitle>
            <SectionLead>
              The unglamorous work of events: rules, proof, payments, and rewards that actually land.
            </SectionLead>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutFeatures.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <StaggerItem key={feature.title}>
                  <div className="flex h-full gap-4 rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] transition hover:border-[var(--sage)]/25 hover:shadow-[var(--shadow-hover)]">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--sage-soft)] text-[var(--sage)]">
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

      {/* Sponsors marquee */}
      <MarketingSection className="overflow-hidden py-12 sm:py-14" tone="white">
        <MarketingContainer>
          <Reveal>
            <SectionEyebrow>Partners</SectionEyebrow>
            <SectionTitle className="text-2xl sm:text-3xl">Brands that back the series</SectionTitle>
          </Reveal>
        </MarketingContainer>
        <div className="relative mt-10 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />
          <motion.div
            className="flex w-max gap-4"
            animate={reduce ? undefined : { x: ["0%", "-50%"] }}
            transition={
              reduce
                ? undefined
                : { duration: 28, ease: "linear", repeat: Infinity }
            }
          >
            {[...aboutSponsors, ...aboutSponsors].map((name, i) => (
              <div
                className="flex h-16 min-w-[9.5rem] items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-6 text-sm font-semibold tracking-tight text-[var(--muted)]"
                key={`${name}-${i}`}
              >
                {name}
              </div>
            ))}
          </motion.div>
        </div>
      </MarketingSection>

      {/* Testimonials */}
      <MarketingSection tone="soft">
        <MarketingContainer>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <SectionEyebrow>Runners</SectionEyebrow>
              <SectionTitle>Words from the finish</SectionTitle>
              <SectionLead>
                Honest notes from people who registered, ran, and got verified.
              </SectionLead>
            </Reveal>
            <TestimonialCarousel />
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* FAQ */}
      <MarketingSection tone="white">
        <MarketingContainer className="max-w-3xl">
          <Reveal>
            <SectionEyebrow>FAQ</SectionEyebrow>
            <SectionTitle>Questions, answered clearly</SectionTitle>
          </Reveal>
          <div className="mt-8">
            {aboutFaqs.map((item) => (
              <FaqItem a={item.a} key={item.q} q={item.q} />
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* CTA */}
      <MarketingSection
        className="overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,rgba(63,93,80,0.55),transparent_50%),radial-gradient(ellipse_at_90%_100%,rgba(255,255,255,0.08),transparent_40%),#0a0a0a]"
        tone="dark"
      >
        <MarketingContainer className="relative text-center">
          <Reveal>
            <SectionEyebrow light>Start your season</SectionEyebrow>
            <SectionTitle className="mx-auto max-w-3xl" light>
              Register for the next mountain-inspired virtual race.
            </SectionTitle>
            <SectionLead className="mx-auto" light>
              Pick a distance, run on your schedule, upload proof, and claim your place on the board.
            </SectionLead>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link className="btn btn-primary rounded-full px-7" href="/register">
                Register now
              </Link>
              <Link className="btn btn-on-dark rounded-full px-7" href="/gallery">
                View gallery
              </Link>
            </div>
          </Reveal>
        </MarketingContainer>
      </MarketingSection>
    </>
  );
}
