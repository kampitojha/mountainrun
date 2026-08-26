"use client";

import { ArrowRight, FileCheck, HelpCircle, Medal, Search, ShieldCheck, Trophy, Truck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { PageShell } from "../components/app-shell";

export default function PrizeSearchPage() {
  const [bib, setBib] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = bib.trim().toUpperCase();
    if (v) window.location.href = `/prize/${encodeURIComponent(v)}`;
  }

  return (
    <PageShell>
      {/* ─── Hero Search Section ─── */}
      <section className="relative overflow-hidden border-b border-(--line) py-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(234, 179, 8, 0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(16, 185, 129, 0.06) 0%, transparent 50%), var(--background)",
          }}
        />

        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3.5 py-1 text-xs font-bold text-(--gold-deep)">
              <Medal className="h-4 w-4" />
              <span>Official Athlete Rewards Tracker</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Track Your Bib &amp; Medals
            </h1>
            <p className="mt-3 text-sm text-(--muted) sm:text-base max-w-lg mx-auto leading-relaxed">
              Enter your official Bib Number to check your GPS timing verification, certificate download, and physical medal courier tracking.
            </p>

            {/* High-Tech Unified Search Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 mx-auto flex flex-col sm:flex-row items-center gap-2.5 rounded-2xl sm:rounded-full border border-white/15 bg-[#121218]/90 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-(--gold) focus-within:ring-2 focus-within:ring-(--gold)/20 max-w-lg"
            >
              <div className="flex w-full sm:flex-1 items-center gap-3 px-3 py-1">
                <Search className="h-5 w-5 shrink-0 text-(--muted)" />
                <input
                  type="text"
                  value={bib}
                  onChange={(e) => setBib(e.target.value)}
                  placeholder="Enter Bib (e.g. MR-2026-0042 or 121603)"
                  autoComplete="off"
                  className="w-full bg-transparent text-sm sm:text-base font-semibold text-foreground placeholder:text-(--muted-soft) focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={!bib.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl sm:rounded-full bg-linear-to-r from-(--gold) to-(--gold-deep) px-6 py-3 text-xs sm:text-sm font-black text-black shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <span>Track Status</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Helper Links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-(--muted)">
              <span>💡 Don&apos;t know your bib?</span>
              <Link
                href="/dashboard"
                className="font-bold text-(--gold-deep) hover:underline flex items-center gap-1"
              >
                Check Athlete Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How Prize Tracking Works ─── */}
      <section className="section bg-transparent">
        <div className="container-page max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-(--gold-deep)">
              Step-by-Step Flow
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              How Prize &amp; Medal Dispatch Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-(--muted)">
              From your first stride to medal unboxing at your doorstep
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                step: "01",
                icon: Trophy,
                title: "Register & Receive Bib",
                desc: "Pick your distance (5K, 10K, 21K, 42K) and receive your official digital Bib number instantly.",
                color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
              },
              {
                step: "02",
                icon: FileCheck,
                title: "Run Anywhere & Submit Proof",
                desc: "Record your run using Strava, Garmin, Nike Run Club, or smartwatch and upload an activity screenshot.",
                color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "GPS Verification Approved",
                desc: "Our race directors verify your timing. Download your official Verified Finisher e-Certificate instantly.",
                color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
              },
              {
                step: "04",
                icon: Truck,
                title: "Physical Medal Dispatched",
                desc: "Your heavy metal die-cast 3D medal is packed and dispatched via Speed Post / BlueDart with live tracking.",
                color: "from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30",
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div
                key={step}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#131318] p-5 transition-all duration-300 hover:border-white/20 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br border ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xl font-black text-white/20 group-hover:text-white/40 transition-colors">
                    {step}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-xs text-(--muted) leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Help & Support Banner */}
          <div className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <HelpCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Need help tracking your shipment?</p>
                <p className="text-xs text-white/70">Our athlete support team is ready on WhatsApp.</p>
              </div>
            </div>

            <a
              href="https://wa.me/917518418960?text=Hi!%20I%20need%20help%20tracking%20my%20bib%20or%20medal."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition-colors"
            >
              <span>💬 WhatsApp Support</span>
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
