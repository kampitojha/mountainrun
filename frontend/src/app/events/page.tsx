import type { Metadata } from "next";
import { FileText, Medal, Shirt, Trophy } from "lucide-react";
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

        <div className="container-page py-6 sm:py-8">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-xl text-center sm:mt-8">
            <p className="eyebrow">Events</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl">
              Upcoming virtual races
            </h1>
            <p className="lede mx-auto mt-4 max-w-lg">
              Choose a run, register once, upload GPS proof, and appear on the verified leaderboard.
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
          <EventsCatalog />
        </div>
      </section>
    </PageShell>
  );
}
