import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { PageShell } from "../components/app-shell";

export const metadata: Metadata = {
  title: "What is a Virtual Run? | How It Works & Guide | Mountain Run",
  description:
    "Learn how virtual running challenges work. Run anywhere, anytime at your own pace using any fitness tracking app, and earn authentic physical medals and verified certificates delivered to your doorstep.",
  alternates: {
    canonical: "https://mountainrun.in/what-is-virtual-run",
  },
};

const STEPS = [
  {
    step: "01",
    title: "Choose & Register",
    icon: Users,
    desc: "Select any open virtual challenge and pick your target distance — from 3 KM, 5 KM, 10 KM, to Half and Full Marathon.",
  },
  {
    step: "02",
    title: "Run Anywhere, Anytime",
    icon: MapPin,
    desc: "Complete your chosen distance wherever you prefer: around your neighborhood, at a local park, on a treadmill, or on an open road.",
  },
  {
    step: "03",
    title: "Track with Any App",
    icon: Smartphone,
    desc: "Record your activity using your favorite GPS app like Strava, Nike Run Club, Garmin, Apple Health, Google Fit, or your smartwatch.",
  },
  {
    step: "04",
    title: "Get Medal & Certificate",
    icon: Award,
    desc: "Upload a screenshot of your finished run. Instantly receive your verified e-certificate, followed by an engraved physical finisher medal delivered to your home.",
  },
];

const COMPATIBLE_APPS = [
  "Strava",
  "Nike Run Club",
  "Garmin Connect",
  "Apple Fitness",
  "Google Fit",
  "Adidas Running",
  "Samsung Health",
  "Coros & Smartwatches",
  "Treadmill Console",
];

const FAQS = [
  {
    q: "Do I have to run in the mountains or hills?",
    a: "No. Mountain Run is our community and brand name representing strength and elevation of spirit. You can run anywhere across India or globally — your neighborhood streets, a nearby park, running track, or indoor treadmill.",
  },
  {
    q: "Can I walk or jog instead of running?",
    a: "Yes, absolutely. We welcome all paces and fitness levels. Whether you walk, power walk, jog, or run, completing the distance is what counts.",
  },
  {
    q: "Can I complete my distance over multiple days?",
    a: "Yes. For longer cumulative distances (like 10 KM, 21 KM, or monthly challenges), you can split your runs across up to 15 days and submit your combined timing proof.",
  },
  {
    q: "How and when will my physical medal be delivered?",
    a: "Once your activity screenshot is reviewed and approved by our timing team, your custom engraved medal and finisher badge are dispatched via Delhivery Express or DTDC. You will receive an email with live courier tracking within 3 to 5 business days.",
  },
  {
    q: "Is there a fixed date or specific start time?",
    a: "No fixed morning timing. You have the complete event window (usually 7 to 30 days) to run at whatever time fits your daily routine.",
  },
  {
    q: "Is my certificate authentic and verifiable?",
    a: "Yes. Every finisher receives an official Mountain Run Certificate of Achievement containing a unique Certificate ID and verifiable QR code that anyone can scan to verify your achievement on mountainrun.in.",
  },
];

export default function WhatIsVirtualRunPage() {
  return (
    <PageShell>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container-page relative z-10 max-w-4xl text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-(--line-strong) bg-(--panel-soft) px-4 py-1.5 shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-(--sage)" />
            <span className="text-xs font-bold uppercase tracking-wider text-(--muted)">
              Beginner &amp; Runner Guide
            </span>
          </div>

          <h1 className="heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            What is a <span className="text-(--sage)">Virtual Run</span>?
          </h1>

          <p className="mt-5 text-base sm:text-xl text-(--muted) max-w-2xl mx-auto leading-relaxed">
            A real running challenge without geographical limits. You run at your own pace, in your own city, on your own schedule — and earn genuine physical medals and verified credentials.
          </p>

          {/* Key highlights pill bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-(--line) bg-(--panel) px-3.5 py-2 shadow-xs">
              <MapPin className="h-4 w-4 text-(--sage)" /> Anywhere in India
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-(--line) bg-(--panel) px-3.5 py-2 shadow-xs">
              <Clock className="h-4 w-4 text-amber-500" /> Any Time &amp; Pace
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-(--line) bg-(--panel) px-3.5 py-2 shadow-xs">
              <Award className="h-4 w-4 text-emerald-500" /> Real Finisher Medal
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-(--line) bg-(--panel) px-3.5 py-2 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-indigo-500" /> Verified Certificate
            </span>
          </div>

          {/* Primary CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/events"
              className="btn btn-primary h-11 px-6 text-sm font-bold shadow-lg gap-2"
            >
              Browse Open Events <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/gallery"
              className="btn btn-secondary h-11 px-5 text-sm font-semibold"
            >
              View Finisher Medals
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works: 4 Steps ─── */}
      <section className="section py-12 sm:py-16 bg-(--panel-soft)/40 border-y border-(--line)">
        <div className="container-page max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow text-(--sage)">Simple Process</p>
            <h2 className="heading text-2xl sm:text-4xl mt-1">
              How a Virtual Run Works in 4 Steps
            </h2>
            <p className="lede text-sm sm:text-base mt-2">
              No crowd stress, no travel expenses. Just you, your running shoes, and your personal goal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="relative rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-sm flex flex-col justify-between transition-all hover:border-(--sage)/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--sage-soft) text-(--sage)">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-black text-(--muted-soft)">
                        {s.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-(--foreground) leading-snug">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-(--muted) leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Compatible Apps Section ─── */}
      <section className="section py-12 sm:py-16">
        <div className="container-page max-w-4xl text-center">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 mb-3">
            <Smartphone className="h-4 w-4" />
          </div>
          <h2 className="heading text-xl sm:text-3xl">
            Use Any Fitness Tracking App
          </h2>
          <p className="lede text-xs sm:text-sm max-w-xl mx-auto mt-2">
            You don&apos;t need proprietary hardware or special tracking devices. Any app or smartwatch that shows your distance, time, and date is accepted.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
            {COMPATIBLE_APPS.map((app) => (
              <div
                key={app}
                className="flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-4 py-2 text-xs font-semibold text-(--foreground) shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-(--sage)" />
                <span>{app}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Transparent FAQs Section ─── */}
      <section className="section py-12 sm:py-16 bg-(--panel-soft)/30 border-t border-(--line)">
        <div className="container-page max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Common Questions</span>
            </div>
            <h2 className="heading text-2xl sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="lede text-xs sm:text-sm mt-2">
              Clear answers to the most common questions from first-time participants.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-(--line) bg-(--panel) p-5 shadow-xs transition-all"
              >
                <h3 className="text-sm sm:text-base font-bold text-(--foreground) flex items-start gap-2.5">
                  <span className="text-(--sage) font-mono text-xs mt-0.5 font-black shrink-0">
                    Q{i + 1}.
                  </span>
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-(--muted) leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom Banner CTA ─── */}
      <section className="section py-14 sm:py-20">
        <div className="container-page max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-(--line-strong) bg-gradient-to-br from-(--panel) via-(--panel-soft) to-(--panel) p-8 sm:p-12 shadow-xl text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage) mb-4 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>

            <h2 className="heading text-2xl sm:text-4xl">
              Ready to Start Your Virtual Run Challenge?
            </h2>

            <p className="mt-3 text-xs sm:text-base text-(--muted) max-w-xl mx-auto leading-relaxed">
              Join thousands of runners across India. Choose your event, run at your pace, and earn your physical medal.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/events"
                className="btn btn-primary h-12 px-7 text-sm font-bold shadow-lg gap-2"
              >
                Explore Active Events <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/leaderboard"
                className="btn btn-secondary h-12 px-6 text-sm font-semibold"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
