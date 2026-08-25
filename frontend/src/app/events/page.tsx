import type { Metadata } from "next";
import { FileText, Medal, Shirt, Trophy } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { fetchGroupedEvents } from "../../lib/events-api";
import { EventsCatalog } from "./events-catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Upcoming Virtual Running Events & Marathons India 2026 | 5K, 10K, 21K Races — Mountain Run",
  description:
    "Explore and register for upcoming virtual running events and marathons across India. Complete 1.5K, 3K, 5K, 10K, or 21K Half Marathons from anywhere. GPS verification, authentic heavy metal finisher medals, DRI-FIT t-shirts, and instant E-certificates.",
  keywords: [
    "virtual running events",
    "virtual running events india",
    "online marathon India",
    "virtual marathon 2026",
    "5K run events india",
    "10K run events india",
    "half marathon virtual india",
    "running races India",
    "GPS verified runs",
    "virtual race registration",
    "marathon athlete medals",
    "running event with medal",
    "strava virtual marathon india",
  ],
  openGraph: {
    title: "Upcoming Virtual Running Events & Marathons India 2026 | 5K, 10K, 21K Races — Mountain Run",
    description:
      "Explore and register for upcoming virtual running events and marathons across India. GPS verification, custom medals & instant certificates.",
    url: "/events",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
};

export default async function EventsPage() {
  const { upcoming, past } = await fetchGroupedEvents().catch(() => ({
    upcoming: [],
    past: [],
  }));

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

        <div className="container-page py-6 sm:py-8">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-8">
            <p className="eyebrow">Virtual Running &amp; Marathon Events</p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Upcoming virtual running events &amp; marathons
            </h1>
            <p className="lede mx-auto mt-4 max-w-xl">
              Choose your challenge, run anywhere at your pace with Strava or Garmin, and claim authentic heavy metal finisher medals delivered across India.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                { label: "Medals", icon: Medal },
                { label: "T-shirts", icon: Shirt },
                { label: "Certificates", icon: FileText },
                { label: "Leaderboard", icon: Trophy },
              ].map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--sage-soft) px-3 py-1 text-xs font-semibold text-(--sage)">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-page">
          <EventsCatalog initialPast={past} initialUpcoming={upcoming} />
        </div>
      </section>
    </PageShell>
  );
}
