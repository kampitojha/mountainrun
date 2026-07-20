import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/app-shell";
import { Breadcrumb } from "../../components/breadcrumb";
import { allPublicEvents, eventBenefits } from "../../data/events";
import { fetchEventBySlug } from "../../../lib/events-api";
import { auth } from "@clerk/nextjs/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  const isPast = event.status === "past";
  const title = `${event.name} - ${event.distance} Virtual Run | Mountain Run`;
  const description = isPast
    ? `View results and recap for ${event.name}. ${event.finishers} finishers, ${event.verifiedResults} verified GPS results from across India.`
    : `Register for ${event.name} - a ${event.distance} virtual running event. GPS verification, medals, certificates, and leaderboard. Entry: ${event.price}.`;

  return {
    title,
    description,
    keywords: [
      event.name,
      event.distance,
      "virtual run",
      "GPS verified",
      "running event",
      "marathon",
      "5K run",
      "10K run",
      "half marathon",
      "virtual race India",
    ],
    openGraph: {
      title,
      description,
      url: `/events/${slug}`,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/events/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return allPublicEvents.map((event) => ({ slug: event.slug }));
}

/** Allow admin-created event slugs that are not in the static catalog. */
export const dynamicParams = true;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const { userId } = await auth();
  const isSignedIn = !!userId;

  const isPast = event.status === "past";

  // Event Schema for SEO
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.name,
    description: event.description,
    url: `${SITE_URL}/events/${slug}`,
    startDate: event.date,
    location: {
      '@type': 'VirtualLocation',
      url: `${SITE_URL}/events/${slug}`,
    },
    organizer: {
      '@type': 'Organization',
      name: 'Mountain Run',
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: 'INR',
      availability: isPast ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    },
    eventStatus: isPast ? 'https://schema.org/EventMovedOnline' : 'https://schema.org/EventScheduled',
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <section className="section">
        <div className="container-page">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
              { name: event.name, href: `/events/${slug}` },
            ]}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow">{isPast ? "Past event" : "Event"}</p>
                <span className={`badge ${isPast ? "badge-sage" : "badge-solid"}`}>
                  {isPast ? "Completed" : "Open for registration"}
                </span>
              </div>
              <h1 className="display mt-4 max-w-3xl">{event.name}</h1>
              <p className="lede mt-6 max-w-2xl">{event.description}</p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  ["Date", event.date],
                  ["Distance", event.distance],
                  ["Entry", event.price],
                ].map(([label, value]) => (
                  <div className="card p-4 sm:p-5" key={label}>
                    <p className="text-[0.65rem] font-medium uppercase tracking-widest text-(--muted) sm:text-xs">
                      {label}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold tracking-tight leading-snug">{value}</p>
                  </div>
                ))}
              </div>

              {isPast ? (
                <div className="mt-10">
                  <h2 className="heading">Event recap</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted)">
                    {event.resultNote ??
                      "This race has finished. Here is a quick look at participation and rewards."}
                  </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      ["Finishers", event.finishers],
                      ["Verified results", event.verifiedResults],
                      ["Cities", event.cities],
                    ].map(([label, value]) => (
                      <div className="card p-4 sm:p-5" key={String(label)}>
                        <p className="text-[0.65rem] font-medium uppercase tracking-widest text-(--muted) sm:text-xs">
                          {label}
                        </p>
                        <p className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                          {typeof value === "number" ? value.toLocaleString("en-IN") : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm leading-6 text-(--muted)">{event.highlight}</p>
                </div>
              ) : null}

              <div className="mt-14">
                <h2 className="heading">{isPast ? "What finishers received" : "What you get"}</h2>
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {eventBenefits.map((benefit) => (
                    <li
                      className="flex items-start gap-3 rounded-xl border border-(--line) bg-(--panel) px-4 py-3.5 text-sm"
                      key={benefit}
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-(--panel-soft) text-[0.65rem] font-semibold">
                        ✓
                      </span>
                      <span className="leading-6 text-(--muted)">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
              {isPast ? (
                <>
                  <p className="eyebrow">Closed</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">Event completed</h2>
                  <p className="mt-3 text-sm leading-6 text-(--muted)">
                    Registration for this race is closed. Explore the recap on this page, or open
                    an upcoming event to register for the next run.
                  </p>
                  <div className="mt-6 space-y-2">
                    <Link className="btn btn-primary btn-full" href="/events">
                      Browse open events
                    </Link>
                    <Link className="btn btn-secondary btn-full" href="/leaderboard">
                      View leaderboard
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="eyebrow">Register</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">Join this event</h2>

                  {event.couponCode && event.showCouponOnCard ? (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <span>Use coupon:</span>
                      <code className="tracking-wider">{event.couponCode}</code>
                    </div>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-(--muted)">
                    {isSignedIn
                      ? "Choose your distance, add delivery details, and pay with UPI to secure your spot. Run within the event window, then upload GPS proof from your dashboard."
                      : "Sign in, choose your distance, add delivery details, and pay with UPI. Run within the event window, then upload GPS proof from your dashboard."}
                  </p>
                  <div className="mt-6 space-y-2">
                    <Link
                      className="btn btn-primary btn-full"
                      href={`/register?event=${encodeURIComponent(event.slug)}`}
                    >
                      {isSignedIn ? "Register for this race" : "Register now"}
                    </Link>
                    <Link className="btn btn-secondary btn-full" href="/events">
                      Browse other events
                    </Link>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
