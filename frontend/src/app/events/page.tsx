import type { Metadata } from "next";
import { PageHeader, PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { EventsCatalog } from "./events-catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Virtual Running Events - Marathons, 5K, 10K Races | Mountain Run",
  description:
    "Browse upcoming virtual running events in India. Register for marathons, 5K, 10K, half marathon races. GPS verification, medals, certificates, and leaderboards.",
  keywords: [
    "virtual running events",
    "online marathon India",
    "5K run events",
    "10K run events",
    "half marathon virtual",
    "running races India",
    "GPS verified runs",
    "virtual race registration",
  ],
  openGraph: {
    title: "Virtual Running Events - Marathons, 5K, 10K Races",
    description:
      "Browse upcoming virtual running events in India. Register for marathons, 5K, 10K, half marathon races.",
    url: "/events",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
};

export default function EventsPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
            ]}
          />
          <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-(--panel)">
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
              <div className="relative min-h-64 bg-[#0f172a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Mountain Run virtual running event - runners completing GPS verified races"
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
