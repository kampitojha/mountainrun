import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppFooter } from "./components/app-footer";
import { AppHeader } from "./components/app-header";
import { HomeEvents } from "./components/home-events";
import { HomeFaq } from "./components/home-faq";
import { HomeGalleryPreview } from "./components/home-gallery-preview";
import { HomeHero } from "./components/home-hero";
import { HomeReviews } from "./components/home-reviews";
import { HomeRewards } from "./components/home-rewards";
import { HomeSectionHeader } from "./components/home-section-header";
import { HomeSteps } from "./components/home-steps";
import { fetchOpenEvents, fetchHomeContent } from "../lib/events-api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Virtual Running Events India 2026 | 5K, 10K & Half Marathons with Real Medals — Mountain Run",
  description:
    "Join India's premier virtual running events and online marathons. Complete 1.5K, 3K, 5K, 10K, or 21K Half Marathons from anywhere. Track with Strava, Nike, or Garmin, and earn authentic heavy metal finisher medals, DRI-FIT t-shirts, and instant verified E-certificates delivered across India.",
  keywords: [
    "virtual running events india",
    "virtual marathon india 2026",
    "online marathon registration india",
    "virtual 5k run india",
    "virtual 10k race india",
    "half marathon virtual india",
    "running events india",
    "marathon athlete medals",
    "strava virtual marathon india",
    "garmin running challenges india",
    "running events with finisher medal",
    "running certificates qr code",
    "fitness challenge india",
    "virtual race registration",
    "upcoming marathons in india 2026",
    "virtual run delhi mumbai bangalore pune",
  ],
  openGraph: {
    title: "Virtual Running Events India 2026 | 5K, 10K & Half Marathons with Real Medals — Mountain Run",
    description:
      "Join India's premier virtual running events. Run anywhere with Strava/Garmin, earn authentic heavy metal finisher medals and digital certificates.",
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function Home() {
  const serverEvents = await fetchOpenEvents({ homeFeaturedFirst: true, limit: 3 }).catch(() => undefined);
  const serverHome = await fetchHomeContent().catch(() => undefined);

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-1 pt-[4.5rem] sm:pt-[5rem] md:pt-[5.5rem]">
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

            <HomeEvents initial={serverEvents} />
          </div>
        </section>

        <HomeRewards />
        {/* Moments + reviews are admin-managed via /admin/content (with static fallbacks). */}
        <HomeGalleryPreview moments={serverHome?.moments} />
        <HomeFaq />
        <HomeReviews testimonials={serverHome?.testimonials} />
      </main>

      <AppFooter />
    </div>
  );
}
