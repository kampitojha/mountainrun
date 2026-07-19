import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppFooter } from "./components/app-footer";
import { AppHeader } from "./components/app-header";
import { HomeEvents } from "./components/home-events";
import { HomeGalleryPreview } from "./components/home-gallery-preview";
import { HomeHero } from "./components/home-hero";
import { HomeReviews } from "./components/home-reviews";
import { HomeRewards } from "./components/home-rewards";
import { HomeSectionHeader } from "./components/home-section-header";
import { HomeSteps } from "./components/home-steps";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Mountain Run - Virtual Running Events with GPS Verification",
  description:
    "Join India's premier virtual running events. Register with UPI, track with GPS, earn medals & certificates. Compete in marathons, 5K, 10K runs from anywhere.",
  keywords: [
    "virtual running",
    "online marathon",
    "GPS run tracking",
    "running events India",
    "virtual marathon",
    "5K run",
    "10K run",
    "half marathon",
    "UPI registration",
    "running medals",
    "running certificates",
    "fitness challenge",
    "virtual race",
  ],
  openGraph: {
    title: "Mountain Run - Virtual Running Events with GPS Verification",
    description:
      "Join India's premier virtual running events. Register with UPI, track with GPS, earn medals & certificates.",
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function Home() {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-1">
        <HomeHero />
        <HomeSteps />

        <section
          className="section border-b border-(--line) relative overflow-hidden"
          style={{
            background:
              "radial-gradient(at 100% 0%, rgba(13, 148, 136, 0.03) 0px, transparent 65%), radial-gradient(at 0% 100%, rgba(99, 102, 241, 0.04) 0px, transparent 65%), var(--background)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute top-1/4 left-10 h-80 w-80 rounded-full bg-teal-500/3 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-1/4 right-10 h-80 w-80 rounded-full bg-indigo-500/4 blur-3xl pointer-events-none"
          />

          <div className="container-page relative z-10">
            <HomeSectionHeader
              action={
                <Link className="btn btn-secondary group w-full sm:w-auto" href="/events">
                  View all events
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              }
              align="split"
              eyebrow="Upcoming"
              lead="Admin-featured events show first. Choose a distance and register from the event page."
              title="Open events"
            />

            <HomeEvents />
          </div>
        </section>

        <HomeRewards />
        {/* Moments + reviews are admin-managed via /admin/content (with static fallbacks). */}
        <HomeGalleryPreview />
        <HomeReviews />
      </main>

      <AppFooter />
    </div>
  );
}
