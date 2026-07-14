import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, primaryLinkClass } from "../../components/app-shell";
import { eventBenefits, publicEvents } from "../../data/events";

export function generateStaticParams() {
  return publicEvents.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = publicEvents.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-dark)]">Event details</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{event.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{event.description}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Date", event.date],
                ["Distance", event.distance],
                ["Entry fee", event.price],
              ].map(([label, value]) => (
                <div className="rounded-lg border hairline bg-white p-4" key={label}>
                  <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
                  <p className="mt-2 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold tracking-tight">What you will get</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {eventBenefits.map((benefit) => (
                  <div className="flex items-center gap-3 rounded-lg border hairline bg-white p-4" key={benefit}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--teal-soft)] text-sm font-bold text-[var(--teal)]">
                      ✓
                    </span>
                    <p className="text-sm font-medium">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-lg border hairline bg-white p-5 soft-shadow">
            <p className="text-sm font-semibold text-[var(--accent-dark)]">Ready to run?</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Register and pay with UPI.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              After payment, run within the event window and upload your GPS screenshot for verification.
            </p>
            <Link className={`${primaryLinkClass} mt-6 w-full`} href="/register">Register now</Link>
            <Link className="focus-ring mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border hairline bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]" href="/events">
              Back to events
            </Link>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
