import { PageHeader, PageShell } from "../components/app-shell";
import { EventsCatalog } from "./events-catalog";

export default function EventsPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page">
          <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <PageHeader
                  eyebrow="Events"
                  description="Choose a run, register once, upload GPS proof, and appear on the verified leaderboard."
                  title="Upcoming virtual races"
                />
                <div className="mt-7 flex flex-wrap gap-2">
                  {["Medals", "T-shirts", "Certificates", "Leaderboard"].map((item) => (
                    <span className="badge badge-sage" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative min-h-64 bg-[var(--foreground)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                  src="/images/mountain-run-hero.png"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white sm:p-8">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/65">
                    Run anywhere
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">
                    Finish with proof. Celebrate with rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <EventsCatalog />
        </div>
      </section>
    </PageShell>
  );
}
