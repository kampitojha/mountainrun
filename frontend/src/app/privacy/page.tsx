import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Privacy Policy | Mountain Run India",
  description:
    "Learn how Mountain Run collects, protects, and manages your personal details, GPS run activity logs, and payment transactions across our virtual running platform.",
  keywords: [
    "mountain run privacy policy",
    "virtual run data privacy india",
    "marathon athlete data protection",
    "mountain run terms and privacy",
  ],
  openGraph: {
    title: "Privacy Policy | Mountain Run India",
    description:
      "Mountain Run data protection, GPS proof privacy, and security practices.",
    url: "/privacy",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
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
        name: "Privacy Policy",
        item: `${SITE_URL}/privacy`,
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
              { name: "Privacy Policy", href: "/privacy" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-3xl text-center sm:mt-8">
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-3 py-1 text-xs font-semibold text-(--sage)">
              <Lock className="h-3.5 w-3.5" />
              Privacy &amp; Data Security
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="lede mx-auto mt-3 max-w-xl text-(--muted)">
              Last updated: August 2026 · Effective across all Mountain Run platforms and services in India.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="section border-b border-(--line)">
        <div className="container-page max-w-3xl">
          <div className="space-y-10 text-sm leading-relaxed text-(--muted) sm:text-base sm:leading-relaxed">

            {/* Intro */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">1. Overview &amp; Commitment</h2>
              <p className="mt-3">
                Mountain Run (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting the privacy and personal data of every runner, athlete, and visitor participating in our virtual running events and marathons across India. This Privacy Policy outlines how your personal information, GPS run activities, and payment details are collected, processed, and safeguarded under the Information Technology Act, 2000 and Digital Personal Data Protection (DPDP) Act, 2023.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">2. Information We Collect</h2>
              <p className="mt-3">
                When you register, submit run proof, or use our website, we may collect the following details:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li><strong className="text-foreground">Personal Identity &amp; Contact:</strong> Full Name, Email Address, WhatsApp/Phone Number, Date of Birth, Gender, and T-shirt size.</li>
                <li><strong className="text-foreground">Shipping Details:</strong> Postal Address, Landmark, City, State, and PIN code for doorstep delivery of your finisher medals and kits.</li>
                <li><strong className="text-foreground">Race &amp; GPS Activity Data:</strong> Screenshots, activity links, or logs from Strava, Garmin, Nike Run Club, Apple Fitness, Google Fit, or treadmill consoles (including distance, elapsed time, average pace, and date).</li>
                <li><strong className="text-foreground">Account &amp; Auth:</strong> Profile authentication details managed securely via Clerk.</li>
              </ul>
            </div>

            {/* How We Use Your Data */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">3. How We Use Your Information</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>To allocate unique race bib numbers and process event registrations.</li>
                <li>To verify GPS running proofs, timing metrics, and calculate category leaderboard rankings.</li>
                <li>To generate verifiable digital E-Certificates equipped with unique QR codes.</li>
                <li>To pack and dispatch your authentic physical finisher medals, custom DRI-FIT t-shirts, and race merchandise via courier partners.</li>
                <li>To send transactional updates regarding bib allocation, proof verification, shipment tracking numbers, and race announcements.</li>
              </ul>
            </div>

            {/* Payment Security */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">4. Payment &amp; Financial Security</h2>
              <p className="mt-3">
                All online payments on Mountain Run are processed through <strong>Razorpay</strong>, an RBI-authorized and PCI-DSS Level 1 compliant payment gateway. 
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-(--sage)/20 bg-(--sage-soft) p-4 text-xs text-(--sage) sm:text-sm">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Mountain Run does <strong>never</strong> store, process, or view your debit/credit card numbers, CVV, Net Banking credentials, or UPI PINs.</span>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">5. Third-Party Service Providers</h2>
              <p className="mt-3">
                We strictly do <strong>not</strong> sell, rent, or trade your personal data. Data is shared solely with vetted operational partners necessary for fulfilling race services:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li><strong>Logistics Partners:</strong> Delhivery, BlueDart, India Post, and Shiprocket for delivering physical medals to your doorstep.</li>
                <li><strong>Authentication &amp; Cloud:</strong> Clerk for runner account security and Cloudinary for run proof media storage.</li>
              </ul>
            </div>

            {/* Your Rights & Contact */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">6. Your Rights &amp; Grievance Officer</h2>
              <p className="mt-3">
                You have the right to review, update, or request deletion of your account and submitted activity proofs at any time. For any data inquiries or grievance redressal:
              </p>
              <div className="mt-4 rounded-xl border border-(--line) bg-(--panel-soft) p-4">
                <p className="font-semibold text-foreground">Mountain Run Grievance Officer</p>
                <p className="mt-1 text-xs sm:text-sm">Email: <a href="mailto:mountainrunofficial@gmail.com" className="text-(--sage) underline">mountainrunofficial@gmail.com</a></p>
                <p className="text-xs sm:text-sm">WhatsApp / Support: +91 7518 418 960</p>
                <p className="text-xs sm:text-sm">Location: Uttar Pradesh, India</p>
              </div>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-between border-t border-(--line) pt-6">
            <Link href="/policies" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Policy Center
            </Link>
            <Link href="/terms" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              Terms of Service →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
