import { PageShell, primaryLinkClass } from "../components/app-shell";
import { AdminEventForm } from "./admin-event-form";

export default function AdminPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 md:py-16">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--accent-dark)]">Admin</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Command center</h1>
          </div>
          <a className={primaryLinkClass} href="#new-event">Create event</a>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[320px_1fr]">
          <AdminEventForm />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Revenue", "Rs. 8.4L"],
              ["Participants", "1,284"],
              ["Proof queue", "342"],
              ["Dispatch", "704"],
            ].map(([label, value]) => (
              <div className="rounded-lg border hairline bg-white p-5" key={label}>
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
