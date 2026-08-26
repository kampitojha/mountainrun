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
    "Explore and register for upcoming virtual running events, online marathons, and fitness challenges across India. Choose 1.5K, 3K, 5K, 10K, or 21K Half Marathon distances. GPS verified with Strava/Garmin, authentic heavy metal finisher medals, DRI-FIT t-shirts, and instant E-certificates.",
  keywords: [
    "upcoming virtual runs",
    "upcoming virtual runs in India",
    "upcoming virtual marathon",
    "upcoming online marathon India",
    "virtual running events upcoming",
    "virtual marathon events",
    "virtual race events India",
    "online running events",
    "upcoming running events India",
    "virtual run calendar India",
    "virtual marathon calendar India",
    "running events calendar India",
    "online marathon events India",
    "5K virtual run",
    "10K virtual run",
    "21K virtual run",
    "half marathon virtual run",
    "virtual run with medal",
    "virtual run registration",
    "virtual marathon registration",
    "virtual race registration",
    "best virtual run India",
    "best virtual marathon India",
    "running events India 2026",
    "5K running events India",
    "10K running events India",
    "21K running events India",
    "running competition in India",
    "marathon registration India 2026",
  ],
  openGraph: {
    title: "Upcoming Virtual Running Events & Marathons India 2026 | 5K, 10K, 21K Races — Mountain Run",
    description:
      "Explore and register for upcoming virtual running events and marathons across India. GPS verification, custom finisher medals & instant certificates.",
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

        <div className="container-page py-8 sm:py-12">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-widest text-(--gold-deep) shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Pan-India Virtual Running Events
            </div>

            <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Find your next <span className="text-gradient-premium">virtual race</span>
            </h1>

            <p className="lede mx-auto mt-3 max-w-xl text-sm sm:text-base text-(--muted)">
              Run anywhere at your own pace with Strava, Nike, or Garmin. Complete your distance and claim authentic heavy metal finisher medals delivered to your doorstep.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "Heavy Metal Medals", icon: Medal },
                { label: "DRI-FIT T-Shirts", icon: Shirt },
                { label: "Official Certificate", icon: FileText },
                { label: "National Leaderboard", icon: Trophy },
              ].map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-(--panel-soft)/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-xs shadow-xs"
                >
                  <Icon className="h-3.5 w-3.5 text-(--gold)" strokeWidth={1.75} />
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
