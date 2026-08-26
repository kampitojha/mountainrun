import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, FileCheck } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Terms of Service | Mountain Run India",
  description:
    "Review the official terms and conditions for participating in Mountain Run virtual marathons, 5K, 10K, 21K challenges, GPS verification guidelines, and finisher rewards across India.",
  keywords: [
    "mountain run terms of service",
    "virtual marathon rules india",
    "running competition terms and conditions",
    "virtual race rules india",
  ],
  openGraph: {
    title: "Terms of Service | Mountain Run India",
    description:
      "Rules, guidelines, and terms of service for Mountain Run virtual running events and marathons.",
    url: "/terms",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsOfServicePage() {
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
        name: "Policy Center",
        item: `${SITE_URL}/policies`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Terms of Service",
        item: `${SITE_URL}/terms`,
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--sage) 14%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />

        <div className="container-page py-8 sm:py-12 md:py-16">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Policies", href: "/policies" },
              { name: "Terms of Service", href: "/terms" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-3xl text-center sm:mt-8">
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-3 py-1 text-xs font-semibold text-(--sage)">
              <FileCheck className="h-3.5 w-3.5" />
              Rules &amp; Participant Agreement
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Terms of Service
            </h1>
            <p className="lede mx-auto mt-3 max-w-xl text-(--muted)">
              Last updated: August 2026 · Please read these terms carefully before registering for any Mountain Run virtual event.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="section border-b border-(--line)">
        <div className="container-page max-w-3xl">
          <div className="space-y-10 text-sm leading-relaxed text-(--muted) sm:text-base sm:leading-relaxed">

            {/* 1. Acceptance */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">1. Acceptance of Terms</h2>
              <p className="mt-3">
                By accessing Mountain Run (<a href="https://mountainrun.in" className="text-(--sage) underline">mountainrun.in</a>) or registering for any virtual run, walk, cycling challenge, or marathon, you agree to be bound by these Terms of Service, all applicable laws and regulations in India, and agree that you are responsible for compliance with any applicable local laws.
              </p>
            </div>

            {/* 2. Virtual Event Concept */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">2. How Virtual Events Work</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>A virtual run is a self-paced, location-independent event. You can run, jog, or walk outdoors (parks, roads, trails) or indoors on a treadmill anywhere in India.</li>
                <li>You must complete the exact distance you registered for (e.g. 1.5 km, 3 km, 5 km, 10 km, or 21 km Half Marathon) within the designated event dates.</li>
                <li>Each registration grants entry for one participant and entitles the finisher to official rewards upon proof verification.</li>
              </ul>
            </div>

            {/* 3. Proof Submission & Fair Play */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">3. GPS Proof Submission &amp; Fair Play Policy</h2>
              <p className="mt-3">
                To maintain the integrity of our national leaderboards and reward distributions:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Runners must record their activity using a recognized GPS tracking app (Strava, Garmin, Nike Run Club, Apple Fitness, Samsung Health, Google Fit) or capture a clear photo of their treadmill console.</li>
                <li>The proof screenshot must clearly show: <strong>Total Distance</strong>, <strong>Elapsed Time</strong>, and <strong>Activity Date</strong>.</li>
                <li>Mountain Run reserves the right to reject proofs that exhibit vehicle assistance, GPS spoofing, altered screenshots, or non-human timing metrics. The decision of our race arbiters is final.</li>
              </ul>
            </div>

            {/* 4. Health & Medical Disclaimer */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">4. Physical Fitness &amp; Health Disclaimer</h2>
                  <p className="mt-2 text-xs leading-relaxed text-(--muted) sm:text-sm sm:leading-relaxed">
                    Running, jogging, and marathons are strenuous physical activities. You acknowledge that you are physically fit, healthy, and capable of participating in your selected challenge. You choose your own route, terrain, and pace. Mountain Run and its organizers are not liable for any injury, accident, dehydration, or health complication incurred during your personal activity.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Rewards & Deliveries */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">5. Finisher Rewards &amp; Shipping</h2>
              <p className="mt-3">
                Every verified finisher receives the rewards included in their chosen package (e.g. Heavy 3D metal medal, DRI-FIT t-shirt, QR-verified E-Certificate). 
              </p>
              <p className="mt-2">
                Physical medal kits are dispatched within 7–10 business days following GPS proof verification to the postal address provided during registration. Please ensure your shipping address and phone number are accurate.
              </p>
            </div>

            {/* 6. Governing Law */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">6. Governing Law &amp; Jurisdiction</h2>
              <p className="mt-3">
                These terms and conditions are governed by and construed in accordance with the laws of India. Any legal dispute or claim arising from participation shall be subject to the exclusive jurisdiction of the competent courts in Uttar Pradesh, India.
              </p>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-between border-t border-(--line) pt-6">
            <Link href="/privacy" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              <ArrowLeft className="h-4 w-4" /> Privacy Policy
            </Link>
            <Link href="/refund" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              Refund &amp; Cancellation Policy →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
