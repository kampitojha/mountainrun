"use client";

import { ArrowRight, HelpCircle, Medal, Search } from "lucide-react";
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
    <PageShell footerMode="minimal">
      {/* ─── Track Search Section ─── */}
      <section className="relative overflow-hidden py-14 sm:py-24 min-h-[70vh] flex items-center justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(234, 179, 8, 0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(16, 185, 129, 0.06) 0%, transparent 50%), var(--background)",
          }}
        />

        <div className="container-page max-w-2xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3.5 py-1 text-xs font-bold text-(--gold-deep)">
            <Medal className="h-4 w-4" />
            <span>Official Athlete Rewards Tracker</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Track Your Bib &amp; Medals
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-(--muted) max-w-md mx-auto leading-relaxed">
            Enter your official Bib Number to check your GPS timing verification, certificate download, and physical medal courier tracking.
          </p>

          {/* Unified Search Form */}
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

          {/* Quick Helper */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-(--muted)">
            <span>Don&apos;t know your bib?</span>
            <Link
              href="/dashboard"
              className="font-bold text-(--gold-deep) hover:underline"
            >
              Check Athlete Dashboard →
            </Link>
          </div>

          {/* Direct WhatsApp Support Card */}
          <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Need help finding your bib?</p>
                <p className="text-[0.7rem] sm:text-xs text-white/70">Connect directly with athlete support.</p>
              </div>
            </div>

            <a
              href="https://wa.me/917518418960?text=Hi!%20I%20need%20help%20tracking%20my%20bib%20or%20medal."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition-colors"
            >
              <span>WhatsApp Support</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
