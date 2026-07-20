import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, IndianRupee, Trophy, BadgeCheck, QrCode, Award, Shirt, MessageCircle, Sparkles, ArrowRight, Users, Timer, Target, Medal, Camera, Smartphone, ShieldCheck, Route } from "lucide-react";
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
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div aria-hidden className="pointer-events-none absolute top-8 right-8 flex gap-1.5 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-(--sage) animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="container-page py-6 sm:py-8">
          <Breadcrumb items={[
            { name: "Home", href: "/" },
            { name: "Events", href: "/events" },
            { name: event.name, href: `/events/${slug}` },
          ]} />

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
            {/* Main content */}
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

              <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-4xl lg:text-5xl">{event.name}</h1>

              {event.activityTypes && event.activityTypes.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {event.activityTypes.map((type) => (
                    <span key={type} className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel-soft) px-3 py-1 text-xs font-semibold capitalize text-(--muted)">
                      {type}
                    </span>
                  ))}
                </div>
              ) : null}

              <p className="mt-5 text-sm leading-relaxed text-(--muted) max-w-2xl sm:text-base">{event.description}</p>

              {/* Info cards */}
              <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Date", value: event.date, icon: CalendarDays },
                  { label: "Distance", value: event.distance, icon: Target },
                  { label: "Entry fee", value: event.price, icon: IndianRupee },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-(--line) bg-(--panel) p-3.5 transition-all hover:border-(--sage)/30 hover:shadow-sm sm:p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted-soft)">{label}</p>
                    <p className="mt-0.5 text-sm font-bold tracking-tight text-(--foreground)">{value}</p>
                  </div>
                ))}
              </div>

              {event.couponCode && event.showCouponOnCard && !isPast ? (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-(--sage)/20 bg-(--sage-soft) px-4 py-3.5 sm:px-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--sage) text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-(--foreground)">Special coupon available</p>
                    <p className="mt-0.5 text-xs text-(--muted)">
                      Use code <code className="rounded-md bg-(--panel) px-1.5 py-0.5 font-bold tracking-wider text-(--sage)">{event.couponCode}</code> at checkout
                    </p>
                  </div>
                </div>
              ) : null}

              <p className="mt-6 text-sm leading-relaxed text-(--muted) italic border-l-2 border-(--sage) pl-4">{event.highlight}</p>

              {/* Benefits */}
              {event.benefits && event.benefits.length > 0 ? (
                <div className="mt-10">
                  <h2 className="text-lg font-bold tracking-tight text-(--foreground) sm:text-xl">{isPast ? "What finishers received" : "What you get"}</h2>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {event.benefits.map((benefit, i) => {
                      const Icon = iconPool[i % iconPool.length];
                      return (
                        <div key={benefit} className="flex items-center gap-3 rounded-xl border border-(--line) bg-(--panel) p-3.5 transition-all hover:border-(--sage)/30 hover:shadow-sm sm:p-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
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

              {/* How it works */}
              {!isPast ? (
                <div className="mt-10">
                  <h2 className="text-lg font-bold tracking-tight text-(--foreground) sm:text-xl">How it works</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { step: "01", title: "Register & pay", desc: "Choose your distance, enter shipping details, and complete payment via UPI.", icon: ShieldCheck },
                      { step: "02", title: "Run anytime", desc: "Complete your distance anywhere during the event window. Track using any GPS app.", icon: Route },
                      { step: "03", title: "Upload proof", desc: "Submit your GPS activity from your dashboard. Get verified and claim your certificate + medal.", icon: Trophy },
                    ].map(({ step, title, desc, icon: Icon }) => (
                      <div key={step} className="relative rounded-xl border border-(--line) bg-(--panel) p-4 transition-all hover:border-(--sage)/30 hover:shadow-sm">
                        <span className="absolute top-3 right-3 text-[1.75rem] font-black leading-none text-(--sage) opacity-10">{step}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <h3 className="mt-3 text-sm font-bold text-(--foreground)">{title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-(--muted)">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Past event recap */}
              {isPast ? (
                <div className="mt-10">
                  <h2 className="text-lg font-bold tracking-tight text-(--foreground) sm:text-xl">Event recap</h2>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    {event.resultNote ?? "This race has finished. Here is a quick look at participation and rewards."}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: "Finishers", value: event.finishers, icon: Users },
                      { label: "Verified", value: event.verifiedResults, icon: BadgeCheck },
                      { label: "Cities", value: event.cities, icon: MapPin },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="rounded-xl border border-(--line) bg-(--panel) p-3.5 text-center transition-all hover:border-(--sage)/30 hover:shadow-sm sm:p-4">
                        <Icon className="mx-auto h-5 w-5 text-(--sage)" strokeWidth={1.75} />
                        <p className="mt-2 text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">{typeof value === "number" ? value.toLocaleString("en-IN") : "\u2014"}</p>
                        <p className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted-soft)">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-(--muted)">{event.highlight}</p>
                </div>
              ) : null}
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel) shadow-sm">
                <div className={`h-1.5 w-full ${isPast ? "bg-(--muted-soft)" : "bg-gradient-to-r from-(--sage) to-emerald-500"}`} />

                <div className="p-5 sm:p-6">
                  {isPast ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--panel-soft) text-(--muted)">
                          <Timer className="h-4 w-4" />
                        </span>
                        <p className="text-xs font-bold uppercase tracking-wider text-(--muted-soft)">Closed</p>
                      </div>
                      <h2 className="mt-4 text-lg font-bold tracking-tight text-(--foreground)">Event completed</h2>
                      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                        Registration for this race is closed. Check out the recap above or browse upcoming events.
                      </p>
                      <div className="mt-5 space-y-2.5">
                        <Link className="btn btn-primary btn-full" href="/events">Browse open events</Link>
                        <Link className="btn btn-secondary btn-full" href="/leaderboard">View leaderboard</Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[0.6rem] font-bold uppercase tracking-wider text-(--muted-soft)">Entry fee</p>
                          <p className="text-2xl font-black tracking-tight text-(--foreground) sm:text-3xl">{event.price}</p>
                        </div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage)">
                          <IndianRupee className="h-5 w-5" />
                        </span>
                      </div>

                      {event.couponCode && event.showCouponOnCard ? (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-(--sage)/20 bg-(--sage-soft) px-3.5 py-2.5">
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
                        <div className="mt-5 border-t border-(--line) pt-4">
                          <p className="mb-2.5 text-[0.6rem] font-bold uppercase tracking-widest text-(--muted-soft)">Includes</p>
                          <div className="space-y-2">
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
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
