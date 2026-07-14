import { Field, PageShell, inputClass, primaryLinkClass } from "../components/app-shell";

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
          <form action="/events" className="rounded-lg border hairline bg-[var(--panel)] p-5" id="new-event">
            <h2 className="text-lg font-semibold">New event</h2>
            <div className="mt-5 grid gap-4">
              <Field label="Event title">
                <input className={inputClass} name="title" placeholder="City Night 10K" required />
              </Field>
              <Field label="Distance options">
                <input className={inputClass} name="distances" placeholder="5K, 10K, 21K" required />
              </Field>
              <Field label="Price">
                <input className={inputClass} name="price" placeholder="499" required />
              </Field>
            </div>
            <button className={`${primaryLinkClass} mt-5 w-full`} type="submit">Save event demo</button>
          </form>
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
