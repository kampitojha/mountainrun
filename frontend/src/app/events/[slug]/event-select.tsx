"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, Footprints, IndianRupee, Route, Sparkles } from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { RegisterCta } from "../../components/register-cta";
import { SectionHeader } from "./reveal";

const WHATSAPP_URL = "https://wa.me/917518418960";

type Activity = { key: string; label: string; icon: typeof Footprints; active: string };

const activities: Activity[] = [
  { key: "run", label: "Run", icon: Footprints, active: "border-[#0d9488] bg-[#0d9488] text-white shadow-[0_8px_20px_-6px_rgba(13,148,136,0.6)]" },
  { key: "walk", label: "Walk", icon: Route, active: "border-sky-500 bg-sky-500 text-white shadow-[0_8px_20px_-6px_rgba(14,165,233,0.6)]" },
  { key: "cycle", label: "Cycle", icon: Bike, active: "border-violet-500 bg-violet-500 text-white shadow-[0_8px_20px_-6px_rgba(139,92,246,0.6)]" },
];

function distanceNum(d: string) {
  const m = d.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function tier(km: number, activity: string) {
  if (activity === "walk" && km >= 5) {
    return {
      label: "Power walk",
      badge: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    };
  }
  if (activity === "cycle") {
    return {
      label: "Ride",
      badge: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    };
  }
  if (km <= 3.2) {
    return {
      label: "Easy starter",
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    };
  }
  if (km === 5) {
    return {
      label: "Classic 5K",
      badge: "border-[#0d9488]/40 bg-[#0d9488]/15 text-teal-300",
    };
  }
  if (km === 10) {
    return {
      label: "10K challenge",
      badge: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    };
  }
  if (km >= 21) {
    return {
      label: "Half marathon",
      badge: "border-(--gold-line) bg-(--gold-soft) text-(--gold-deep)",
    };
  }
  return {
    label: "Challenge",
    badge: "border-white/10 bg-white/5 text-(--muted)",
  };
}

function formatPrice(price: string) {
  return price.replace(/^Rs\.\s*/, "₹");
}

export function EventSelect({ event }: { event: PublicEvent }) {
  const [activity, setActivity] = useState(activities[0].key);
  const distances = event.distance.split(" / ");
  const whatsappUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(`Hi! I'm interested in ${event.name}. Can you help me with registration?`)}`;
  const amount = event.price.toLowerCase().includes("free") ? "Free" : formatPrice(event.price);
  const mrp = event.compareAtPrice ? formatPrice(event.compareAtPrice) : null;

  return (
    <section
      className="relative overflow-hidden border-b border-(--line)"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 60%), var(--background)",
      }}
    >
      <div className="container-page py-14 sm:py-20">
        <SectionHeader
          eyebrow="Choose & run"
          title={
            <>
              Pick your challenge,{" "}
              <span className="text-gold">find your pace</span>
            </>
          }
          lead="Choose a distance that suits your rhythm — tap it to register. Every entry includes the full reward kit."
        />

        <div className="mt-10 grid items-start gap-6 sm:mt-14 lg:grid-cols-[1.1fr_360px] lg:gap-8">
          {/* Purchase / Payment card - appears FIRST on mobile */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-3xl border border-(--gold-line) bg-(--panel) shadow-premium">
              <div className="h-1.5 w-full bg-gradient-to-r from-(--gold) via-(--sage) to-(--gold)" />

              <div className="p-5 sm:p-6">
                {/* Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-(--muted-soft)">
                      Entry fee
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        {amount}
                      </span>
                      {mrp ? (
                        <span className="text-sm font-medium text-(--muted-soft) line-through">
                          {mrp}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-(--gold-soft) px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-(--gold-deep)">
                      <Sparkles className="h-3 w-3" />
                      Early bird price · kit included
                    </p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl grad-gold text-white shadow-gold">
                    <IndianRupee className="h-5 w-5" />
                  </span>
                </div>

                {/* What's included */}
                <div className="mt-5 rounded-2xl border border-(--gold-line) bg-(--gold-soft) p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-(--gold-deep)">
                    Every entry includes
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[0.72rem] font-medium text-(--muted)">
                    <li className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 shrink-0 text-(--gold-deep)" />
                      Finisher medal for everyone
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 shrink-0 text-(--gold-deep)" />
                      Verified finish on the public leaderboard
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 shrink-0 text-(--gold-deep)" />
                      Free doorstep delivery across India
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-5 space-y-2.5">
                  <RegisterCta
                    className="btn-full btn-lg"
                    signedInLabel="Register now"
                    signedOutLabel={`Register now - ${amount}`}
                    slug={event.slug}
                  />
                  <Link
                    className="btn btn-secondary btn-full gap-2 text-sm"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Have questions? Ask on WhatsApp
                  </Link>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.7rem] font-medium text-(--muted-soft)">
                  <Sparkles className="h-3 w-3 text-(--gold-deep)" />
                  Secure UPI payment · Instant confirmation · Refund-safe
                </p>
              </div>
            </div>
          </div>

          {/* Distance picker - appears AFTER payment card on mobile */}
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl border border-(--line) bg-(--panel) p-5 shadow-premium sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[0.68rem] font-black uppercase tracking-widest text-(--gold-deep)">
                  Select Distance / Category
                </p>
                <span className="text-[0.65rem] font-semibold text-(--muted)">
                  Tap to choose
                </span>
              </div>

              {/* Activity segmented */}
              <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-(--panel-soft) p-1.5">
                {activities.map(({ key, label, icon: Icon, active }) => {
                  const isOn = activity === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActivity(key)}
                      aria-pressed={isOn}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold capitalize transition-all duration-200 cursor-pointer ${
                        isOn
                          ? active
                          : "border-transparent bg-transparent text-(--muted) hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Distance chips */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {distances.map((distance) => {
                  const km = distanceNum(distance);
                  const t = tier(km ?? 5, activity);
                  const isPopular = km === 5 || km === 10;
                  return (
                    <Link
                      key={distance}
                      href={`/register?event=${encodeURIComponent(event.slug)}&distance=${encodeURIComponent(distance)}`}
                      className={`group relative flex min-h-[82px] flex-col justify-between rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.7)] ${
                        isPopular
                          ? "border-(--gold)/70 bg-gradient-to-b from-[#241f14] via-[#1a1710] to-[#12110c] shadow-[0_0_20px_rgba(201,162,39,0.15)] hover:border-(--gold)"
                          : "border-white/10 bg-gradient-to-b from-[#1b1b22] via-[#14141a] to-[#0f0f13] hover:border-(--gold-line) hover:bg-[#1f1f28]"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-(--gold-deep) to-(--gold) px-2.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wider text-black shadow-md">
                          Most Popular
                        </span>
                      )}
                      
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-(--gold)">
                          {distance}
                        </span>
                        <span className={`rounded-md border px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider ${t.badge}`}>
                          {t.label}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5">
                        <span className="text-[0.62rem] font-semibold text-(--muted) group-hover:text-foreground transition-colors">
                          Kit &amp; Medal
                        </span>
                        <span className="text-xs font-black text-(--gold-deep)">
                          {amount}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}