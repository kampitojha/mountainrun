import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/app-shell";
import { allPublicEvents, eventBenefits } from "../../data/events";
import { fetchEventBySlug } from "../../../lib/events-api";
import { auth } from "@clerk/nextjs/server";

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

  return (
    <PageShell>
      <section className="section">
        <div className="container-page">
          <Link
            className="text-sm text-(--muted) transition hover:text-foreground"
            href="/events"
          >
            ← All events
          </Link>

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

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["Date", event.date],
                  ["Distance", event.distance],
                  ["Entry", event.price],
                ].map(([label, value]) => (
                  <div className="card p-5" key={label}>
                    <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold tracking-tight">{value}</p>
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
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Finishers", event.finishers],
                      ["Verified results", event.verifiedResults],
                      ["Cities", event.cities],
                    ].map(([label, value]) => (
                      <div className="card p-5" key={String(label)}>
                        <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                          {label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
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
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {eventBenefits.map((benefit) => (
                    <li
                      className="flex items-start gap-3 rounded-xl border border-(--line) bg-white px-4 py-3.5 text-sm"
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

            <aside className="card h-fit p-6 lg:sticky lg:top-24">
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
                  <p className="mt-3 text-sm leading-6 text-(--muted)">
                    {isSignedIn
                      ? "Choose your distance, add delivery details, and pay with UPI to secure your spot. Run within the event window, then upload GPS proof from your dashboard."
                      : "Sign in, choose your distance, add delivery details, and pay with UPI. Run within the event window, then upload GPS proof from your dashboard."}
                  </p>
                  <div className="mt-6 space-y-2">
                    <Link className="btn btn-primary btn-full" href="/register">
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
