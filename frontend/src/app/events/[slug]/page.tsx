import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, IndianRupee, Trophy, BadgeCheck, QrCode, Award, Shirt, MessageCircle, Sparkles, ArrowRight, Users, Timer, Target } from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { Breadcrumb } from "../../components/breadcrumb";
import { allPublicEvents, eventBenefits } from "../../data/events";
import { fetchEventBySlug } from "../../../lib/events-api";
import { auth } from "@clerk/nextjs/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

const activityConfig: Record<string, { icon: string; color: string; bg: string }> = {
  running: { icon: "\u{1F3C3}", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  cycling: { icon: "\u{1F6B4}", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
  walking: { icon: "\u{1F6B6}", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
};

const benefitIcons = [
  BadgeCheck, MapPin, Trophy, QrCode, Award, Shirt, MessageCircle,
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };

  const isPast = event.status === "past";
  const metaTitle = `${event.name} - ${event.distance} Virtual Run | Mountain Run`;
  const metaDescription = isPast
    ? `View results and recap for ${event.name}. ${event.finishers} finishers, ${event.verifiedResults} verified GPS results from across India.`
    : `Register for ${event.name} - a ${event.distance} virtual running event. GPS verification, medals, certificates, and leaderboard. Entry: ${event.price}.`;
  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [event.name, event.distance, "virtual run", "GPS verified", "running event", "marathon", "5K run", "10K run", "half marathon", "virtual race India"],
    openGraph: { title: metaTitle, description: metaDescription, url: `/events/${slug}`, type: "website", images: [{ url: "/og-image.png", width: 1200, height: 630, alt: event.name }] },
    alternates: { canonical: `${SITE_URL}/events/${slug}` },
  };
}

export function generateStaticParams() {
  return allPublicEvents.map((event) => ({ slug: event.slug }));
}

export const dynamicParams = true;

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const { userId } = await auth();
  const isSignedIn = !!userId;
  const isPast = event.status === "past";

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SportsEvent',
          name: event.name,
          description: event.description,
          url: `${SITE_URL}/events/${slug}`,
          startDate: event.date,
          location: { '@type': 'VirtualLocation', url: `${SITE_URL}/events/${slug}` },
          organizer: { '@type': 'Organization', name: 'Mountain Run', url: SITE_URL },
          offers: { '@type': 'Offer', price: event.price, priceCurrency: 'INR', availability: isPast ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
          eventStatus: isPast ? 'https://schema.org/EventMovedOnline' : 'https://schema.org/EventScheduled',
        }),
      }} />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(at 20% 20%, rgba(13,148,136,0.07) 0px, transparent 55%), radial-gradient(at 80% 0%, rgba(99,102,241,0.05) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(13,148,136,0.04) 0px, transparent 50%)" }}
        />
        <div aria-hidden="true" className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-teal-500/4 blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute top-1/3 right-10 h-48 w-48 rounded-full bg-indigo-500/4 blur-3xl pointer-events-none" />

        <div className="container-page relative z-10 py-12 sm:py-16 lg:py-20">
          <Breadcrumb items={[
            { name: "Home", href: "/" },
            { name: "Events", href: "/events" },
            { name: event.name, href: `/events/${slug}` },
          ]} />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
            {/* Left column */}
            <div>
              {/* Status + badges row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">{isPast ? "Past Event" : "Open Event"}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  isPast
                    ? "bg-(--panel-soft) text-(--muted) border border-(--line)"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                }`}>
                  {isPast ? <Timer className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {isPast ? "Completed" : "Open for registration"}
                </span>
              </div>

              <h1 className="display mt-4 max-w-3xl text-(--foreground)">{event.name}</h1>

              {/* Activity types */}
              {event.activityTypes && event.activityTypes.length > 0 ? (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {event.activityTypes.map((type) => {
                    const cfg = activityConfig[type] ?? { icon: "", color: "text-(--muted)", bg: "bg-(--panel-soft)" };
                    return (
                      <span key={type} className={`inline-flex items-center gap-1.5 rounded-full border border-(--line) px-3 py-1 text-xs font-semibold capitalize ${cfg.color} ${cfg.bg}`}>
                        <span>{cfg.icon}</span>
                        {type}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              <p className="mt-6 text-base leading-relaxed text-(--muted) max-w-2xl">{event.description}</p>

              {/* Quick info cards */}
              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Date", value: event.date, icon: CalendarDays },
                  { label: "Distance", value: event.distance, icon: Target },
                  { label: "Entry fee", value: event.price, icon: IndianRupee },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="card flex flex-col items-start gap-2 p-4 sm:p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--panel-soft) text-(--sage)">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-(--muted-soft) sm:text-xs">{label}</p>
                      <p className="mt-0.5 text-sm font-bold tracking-tight leading-snug text-(--foreground)">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon banner */}
              {event.couponCode && event.showCouponOnCard && !isPast ? (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-transparent px-5 py-4 dark:border-emerald-800/40 dark:from-emerald-950/30">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Special coupon available</p>
                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                      Use code <code className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold tracking-wider text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">{event.couponCode}</code> at checkout
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Description / highlight */}
              <p className="mt-8 text-sm leading-relaxed text-(--muted) italic border-l-2 border-(--sage) pl-4">{event.highlight}</p>

              {/* Benefits */}
              <div className="mt-14">
                <h2 className="text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">{isPast ? "What finishers received" : "What you get"}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {eventBenefits.map((benefit, i) => {
                    const Icon = benefitIcons[i % benefitIcons.length];
                    return (
                      <div key={benefit} className="flex items-start gap-3 rounded-xl border border-(--line) bg-(--panel) p-4 transition-all duration-200 hover:border-(--line-strong) hover:shadow-sm">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-(--foreground)">{benefit}</p>
                          <p className="mt-0.5 text-xs text-(--muted-soft)">Included with your registration</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How it works (upcoming only) */}
              {!isPast ? (
                <div className="mt-14">
                  <h2 className="text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">How it works</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                      { step: "01", title: "Register & pay", desc: "Choose your distance, enter shipping details, and complete payment via UPI.", icon: BadgeCheck },
                      { step: "02", title: "Run anytime", desc: "Complete your distance anywhere during the event window. Track using any GPS app.", icon: MapPin },
                      { step: "03", title: "Upload proof", desc: "Submit your GPS activity from your dashboard. Get verified and claim your certificate + medal.", icon: Trophy },
                    ].map(({ step, title, desc, icon: Icon }) => (
                      <div key={step} className="relative rounded-xl border border-(--line) bg-(--panel) p-5 transition-all duration-200 hover:border-(--line-strong) hover:shadow-sm">
                        <span className="text-[2rem] font-black leading-none text-(--sage) opacity-20 step-card-number">{step}</span>
                        <span className="mt-3 flex h-9 w-9 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <h3 className="mt-4 text-sm font-bold text-(--foreground)">{title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-(--muted)">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Past event recap */}
              {isPast ? (
                <div className="mt-14">
                  <h2 className="text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">Event recap</h2>
                  <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                    {event.resultNote ?? "This race has finished. Here is a quick look at participation and rewards."}
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: "Finishers", value: event.finishers, icon: Users },
                      { label: "Verified", value: event.verifiedResults, icon: BadgeCheck },
                      { label: "Cities", value: event.cities, icon: MapPin },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="card flex flex-col items-start gap-2 p-4 sm:p-5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-(--muted-soft) sm:text-xs">{label}</p>
                          <p className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">{typeof value === "number" ? value.toLocaleString("en-IN") : "\u2014"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-(--muted)">{event.highlight}</p>
                </div>
              ) : null}
            </div>

            {/* ── Sidebar ── */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-sm sm:p-7">
                {isPast ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--panel-soft) text-(--muted)">
                        <Timer className="h-4 w-4" />
                      </span>
                      <p className="text-xs font-bold uppercase tracking-wider text-(--muted-soft)">Closed</p>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-(--foreground)">Event completed</h2>
                    <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                      Registration for this race is closed. Check out the recap above or browse upcoming events.
                    </p>
                    <div className="mt-6 space-y-2.5">
                      <Link className="btn btn-primary btn-full" href="/events">Browse open events</Link>
                      <Link className="btn btn-secondary btn-full" href="/leaderboard">View leaderboard</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-(--muted-soft)">Entry fee</p>
                        <p className="text-3xl font-black tracking-tight text-(--foreground)">{event.price}</p>
                      </div>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <IndianRupee className="h-6 w-6" />
                      </span>
                    </div>

                    {event.couponCode && event.showCouponOnCard ? (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/30">
                        <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                          Use code <strong className="tracking-wider">{event.couponCode}</strong>
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-5 space-y-2.5">
                      <Link className="btn btn-primary btn-full gap-2 text-sm" href={`/register?event=${encodeURIComponent(event.slug)}`}>
                        {isSignedIn ? "Register for this race" : "Register now"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link className="btn btn-secondary btn-full text-sm" href="/events">Browse other events</Link>
                    </div>

                    {/* Trust signals */}
                    <div className="mt-6 space-y-2.5 border-t border-(--line) pt-5">
                      {[
                        { icon: BadgeCheck, text: "GPS verified results" },
                        { icon: Award, text: "Finisher medal & certificate" },
                        { icon: Users, text: `${event.activityTypes?.length ?? 1} activity types` },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2.5 text-xs text-(--muted)">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-(--sage)" />
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>

                    {!isSignedIn ? (
                      <div className="mt-4 rounded-xl bg-(--panel-soft) px-4 py-3 text-center text-xs text-(--muted)">
                        Already have an account? <Link href="/sign-in" className="font-semibold text-(--sage) hover:underline">Sign in</Link>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
