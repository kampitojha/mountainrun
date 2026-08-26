import { Suspense } from "react";
import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { LeaderboardClient } from "./leaderboard-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "National Virtual Running Leaderboard 2026 | Verified Race Results & Rankings — Mountain Run",
  description:
    "Explore live GPS-verified virtual running leaderboards, marathon results, athlete rankings, pace, and race stats for 5K, 10K, and 21K Half Marathon challenges across India.",
  keywords: [
    "marathon results India",
    "running event results",
    "marathon results 2026",
    "running race results",
    "5K results India",
    "10K results India",
    "half marathon results India",
    "running leaderboard",
    "marathon athlete ranking india",
    "GPS verified results",
    "virtual race results india",
    "marathon finish times",
    "online running rankings",
    "5k 10k half marathon leaderboard",
    "strava running rankings india",
  ],
  openGraph: {
    title: "National Virtual Running Leaderboard 2026 | Verified Race Results & Rankings — Mountain Run",
    description:
      "View live GPS-verified running results, pace, and rankings from Mountain Run virtual events across India.",
    url: "/leaderboard",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/leaderboard`,
  },
};

export default function LeaderboardPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Official Leaderboard",
        item: `${SITE_URL}/leaderboard`,
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="page-section">
        <div className="container-page max-w-5xl">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Leaderboard", href: "/leaderboard" },
            ]}
          />
          <Suspense
            fallback={
              <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-(--panel) py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-(--line) border-t-(--sage)" />
                <p className="mt-4 text-sm font-medium text-(--muted)">Loading leaderboard...</p>
              </div>
            }
          >
            <LeaderboardClient />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
