import Link from "next/link";
import { PageShell, primaryLinkClass } from "../components/app-shell";
import { eventBenefits, publicEvents } from "../data/events";

export default function EventsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 md:py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Events</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Choose a run, register, upload proof, and compete on the verified leaderboard.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {publicEvents.map((event) => (
            <article className="rounded-lg border hairline bg-white p-5" key={event.slug}>
              <p className="text-sm text-[var(--muted)]">{event.date}</p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">{event.name}</h2>
              <p className="mt-3 text-sm text-[var(--muted)]">{event.distance}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{event.highlight}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {eventBenefits.slice(0, 3).map((benefit) => (
                  <span className="rounded-full bg-[var(--panel-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]" key={benefit}>
                    {benefit}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm font-semibold">{event.price}</p>
              <div className="mt-5 grid gap-2">
                <Link className={primaryLinkClass} href={`/events/${event.slug}`}>View details</Link>
                <Link className="focus-ring inline-flex h-11 items-center justify-center rounded-lg border hairline bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]" href="/register">Register</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
