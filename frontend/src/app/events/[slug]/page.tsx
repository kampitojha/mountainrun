import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, IndianRupee, Trophy, BadgeCheck, QrCode, Award, Shirt, MessageCircle, Sparkles, ArrowRight, Users, Timer, Target, Medal, Camera, Smartphone } from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { Breadcrumb } from "../../components/breadcrumb";
import { allPublicEvents } from "../../data/events";
import { fetchEventBySlug } from "../../../lib/events-api";
import { auth } from "@clerk/nextjs/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

const iconPool = [Medal, BadgeCheck, QrCode, Trophy, MapPin, Award, Shirt, Camera, Smartphone, MessageCircle];

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

      <section className="relative overflow-hidden border-b border-(--line)">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(at 20% 20%, var(--sage-soft) 0px, transparent 55%), radial-gradient(at 50% 100%, color-mix(in srgb, var(--sage) 4%, transparent) 0px, transparent 50%)" }}
        />
        <div aria-hidden="true" className="absolute top-0 left-1/4 h-64 w-64 rounded-full blur-3xl pointer-events-none" style={{ background: "color-mix(in srgb, var(--sage) 7%, transparent)" }} />
        <div aria-hidden="true" className="absolute top-1/3 right-10 h-48 w-48 rounded-full blur-3xl pointer-events-none" style={{ background: "color-mix(in srgb, var(--sage) 5%, transparent)" }} />

        <div className="container-page relative z-10 py-12 sm:py-16 lg:py-20">
          <Breadcrumb items={[
            { name: "Home", href: "/" },
            { name: "Events", href: "/events" },
            { name: event.name, href: `/events/${slug}` },
          ]} />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">{isPast ? "Past Event" : "Open Event"}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  isPast
                    ? "bg-(--panel-soft) text-(--muted)"
                    : "bg-(--sage-soft) text-(--sage)"
                }`}>
                  {isPast ? <Timer className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {isPast ? "Completed" : "Open for registration"}
                </span>
              </div>

              <h1 className="display mt-4 max-w-3xl text-(--foreground)">{event.name}</h1>

              {event.activityTypes && event.activityTypes.length > 0 ? (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {event.activityTypes.map((type) => (
                    <span key={type} className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel-soft) px-3 py-1 text-xs font-semibold capitalize text-(--muted)">
                      <span>{type === "running" ? "\u{1F3C3}" : type === "cycling" ? "\u{1F6B4}" : "\u{1F6B6}"}</span>
                      {type}
                    </span>
                  ))}
                </div>
              ) : null}

              <p className="mt-6 text-base leading-relaxed text-(--muted) max-w-2xl">{event.description}</p>

              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Date", value: event.date, icon: CalendarDays },
                  { label: "Distance", value: event.distance, icon: Target },
                  { label: "Entry fee", value: event.price, icon: IndianRupee },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="card flex flex-col items-start gap-2 p-4 sm:p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-(--muted-soft) sm:text-xs">{label}</p>
                      <p className="mt-0.5 text-sm font-bold tracking-tight leading-snug text-(--foreground)">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {event.couponCode && event.showCouponOnCard && !isPast ? (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-(--line) bg-(--sage-soft) px-5 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--sage) text-white">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-(--foreground)">Special coupon available</p>
                    <p className="mt-0.5 text-xs text-(--muted)">
                      Use code <code className="rounded-md bg-(--panel) px-2 py-0.5 font-bold tracking-wider text-(--sage)">{event.couponCode}</code> at checkout
                    </p>
                  </div>
                </div>
              ) : null}

              <p className="mt-8 text-sm leading-relaxed text-(--muted) italic border-l-2 border-(--sage) pl-4">{event.highlight}</p>

              {event.benefits && event.benefits.length > 0 ? (
                <div className="mt-14">
                  <h2 className="text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">{isPast ? "What finishers received" : "What you get"}</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {event.benefits.map((benefit, i) => {
                      const Icon = iconPool[i % iconPool.length];
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
              ) : null}

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
                        <span className="text-[2rem] font-black leading-none text-(--sage) opacity-15">{step}</span>
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
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage)">
                        <IndianRupee className="h-6 w-6" />
                      </span>
                    </div>

                    {event.couponCode && event.showCouponOnCard ? (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-(--line) bg-(--sage-soft) px-4 py-3">
                        <Sparkles className="h-4 w-4 shrink-0 text-(--sage)" />
                        <p className="text-xs text-(--muted)">
                          Use code <strong className="tracking-wider text-(--sage)">{event.couponCode}</strong>
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

                    {event.benefits && event.benefits.length > 0 ? (
                      <div className="mt-6 space-y-2.5 border-t border-(--line) pt-5">
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-(--muted-soft)">Includes</p>
                        {event.benefits.map((benefit, i) => {
                          const Icon = iconPool[i % iconPool.length];
                          return (
                            <div key={benefit} className="flex items-center gap-2.5 text-xs text-(--muted)">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-(--sage)" />
                              <span>{benefit}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

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
