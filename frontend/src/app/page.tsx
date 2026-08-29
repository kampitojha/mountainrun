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
import { HomeSectionHeader } from "./components/home-section-header";
import { fetchOpenEvents, fetchHomeContent } from "../lib/events-api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Virtual Running Events India 2026 | Virtual Marathon, 5K, 10K & Half Marathons with Real Medals — Mountain Run",
  description:
    "Join India's premier virtual running events and online marathons. Complete 1.5K, 3K, 5K, 10K, or 21K Half Marathons from anywhere. Track with Strava, Nike Run Club, or Garmin, and earn authentic heavy metal finisher medals, DRI-FIT t-shirts, and instant QR-verified E-certificates delivered with free shipping across India.",
  keywords: [
    "virtual run",
    "virtual run India",
    "virtual marathon",
    "virtual marathon India",
    "online marathon",
    "online marathon India",
    "virtual running events India",
    "virtual running events 2026",
    "online running event",
    "virtual race India",
    "5K virtual run",
    "10K virtual run",
    "21K virtual run",
    "half marathon virtual run",
    "virtual half marathon",
    "virtual run with medal",
    "virtual run medal India",
    "virtual marathon medal and certificate",
    "finisher medal India",
    "virtual run with t shirt",
    "virtual run kit India",
    "virtual run certificate",
    "virtual run registration India",
    "register for virtual marathon",
    "upcoming virtual runs in India",
    "best virtual run in India",
    "best virtual marathon in India",
    "virtual run platform India",
    "running events India 2026",
    "upcoming marathons in India 2026",
    "5K run India",
    "10K run India",
    "21K run India",
    "strava virtual marathon india",
    "garmin running challenges india",
    "virtual cycling challenge india",
    "virtual run for beginners",
    "virtual run with free delivery",
  ],
  openGraph: {
    title: "Virtual Running Events India 2026 | Virtual Marathon, 5K, 10K & Half Marathons with Real Medals — Mountain Run",
    description:
      "Join India's premier virtual running events and online marathons. Run anywhere with Strava/Garmin, earn authentic heavy metal finisher medals, DRI-FIT t-shirts, and verified digital certificates.",
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
        {/* 1. Brand Introduction Hero */}
        <HomeHero />

        {/* 2. 🔥 Live Active Virtual Races (Immediate Spotlight) */}
        <section
          className="section border-b border-(--line) relative overflow-hidden"
          style={{
            background:
              "radial-gradient(at 100% 0%, rgba(212, 175, 55, 0.05) 0px, transparent 65%), radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.04) 0px, transparent 65%), var(--background)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute top-1/4 left-10 h-80 w-80 rounded-full bg-(--gold)/5 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-1/4 right-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"
          />

          <div className="container-page relative z-10">
            <HomeSectionHeader
              action={
                <Link className="btn btn-secondary group w-full sm:w-auto" href="/events">
                  Browse all races
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              }
              align="split"
              eyebrow="Open For Registration"
              lead="Featured live races. Choose your distance and claim your authentic finisher medal."
              title="Featured virtual races"
            />

            <HomeEvents initial={serverEvents} />
          </div>
        </section>

        {/* 3. 📸 Athlete Gallery, FAQ & Reviews */}
        <HomeGalleryPreview moments={serverHome?.moments} />
        <HomeFaq />
        <HomeReviews testimonials={serverHome?.testimonials} />
      </main>

      <AppFooter />
    </div>
  );
}
