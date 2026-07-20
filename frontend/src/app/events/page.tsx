import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "../components/app-shell";
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

        <div className="container-page py-8 sm:py-10">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
            ]}
          />

          <div className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-(--panel) sm:mt-8">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="eyebrow">Events</p>
                <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-4xl">
                  Upcoming virtual races
                </h1>
                <p className="lede mt-4 max-w-lg">
                  Choose a run, register once, upload GPS proof, and appear on the verified leaderboard.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { label: "Medals", icon: "🏅" },
                    { label: "T-shirts", icon: "👕" },
                    { label: "Certificates", icon: "📜" },
                    { label: "Leaderboard", icon: "🏆" },
                  ].map(({ label, icon }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--sage-soft) px-3 py-1 text-xs font-semibold text-(--sage) transition-colors hover:border-(--sage)/30">
                      <span>{icon}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative min-h-72 bg-[#0a0a0c] sm:min-h-80 lg:min-h-full overflow-hidden">
                <Image
                  alt="Mountain Run virtual running event"
                  src="/images/mountain-run-hero.png"
                  fill
                  className="object-cover opacity-70 transition-opacity hover:opacity-80"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={80}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Run anywhere</p>
                  <p className="mt-1.5 text-lg font-bold text-white sm:text-xl">Finish with proof. Celebrate with rewards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-page">
          <EventsCatalog />
        </div>
      </section>
    </PageShell>
  );
}
