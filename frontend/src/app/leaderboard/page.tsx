import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { LeaderboardClient } from "./leaderboard-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Running Leaderboard - Verified Results | Mountain Run",
 description:
    "View GPS-verified running results and rankings. See top performers in virtual marathons, 5K, 10K races across India. Real-time leaderboards.",
 keywords: [
    "running leaderboard",
    "verified results",
    "GPS rankings",
    "virtual race results",
    "marathon leaderboard",
    "running rankings India",
  ],
 openGraph: {
    title: "Running Leaderboard - Verified Results",
 description:
      "View GPS-verified running results and rankings from Mountain Run events.",
    url: "/leaderboard",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/leaderboard`,
  },
};

export default function LeaderboardPage() {
  return (
    <PageShell>
      <section className="page-section">
        <div className="container-page max-w-5xl">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Leaderboard", href: "/leaderboard" },
            ]}
          />
          <LeaderboardClient />
        </div>
      </section>
    </PageShell>
  );
}
