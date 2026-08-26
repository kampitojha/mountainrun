import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, PackageCheck, Truck } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Mountain Run India",
  description:
    "Learn about Mountain Run 100% free doorstep delivery across 19,000+ Indian pincodes for heavy metal finisher medals, DRI-FIT t-shirts, and race kits.",
  keywords: [
    "mountain run shipping policy",
    "virtual marathon medal delivery india",
    "marathon kit delivery timeline",
    "running medal shipping india",
  ],
  openGraph: {
    title: "Shipping & Delivery Policy | Mountain Run India",
    description:
      "Information on nationwide shipping, delivery timelines, and courier tracking for Mountain Run medals.",
    url: "/shipping",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/shipping`,
  },
};

export default function ShippingPolicyPage() {
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
        name: "Shipping & Delivery",
        item: `${SITE_URL}/shipping`,
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
              { name: "Shipping & Delivery", href: "/shipping" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-3xl text-center sm:mt-8">
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-3 py-1 text-xs font-semibold text-(--sage)">
              <Truck className="h-3.5 w-3.5" />
              Pan-India Doorstep Delivery
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="lede mx-auto mt-3 max-w-xl text-(--muted)">
              Last updated: August 2026 · We deliver authentic heavy metal finisher medals and runner kits to every corner of India with zero shipping fees.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Content */}
      <section className="section border-b border-(--line)">
        <div className="container-page max-w-3xl">
          <div className="space-y-10 text-sm leading-relaxed text-(--muted) sm:text-base sm:leading-relaxed">

            {/* 1. Free Pan-India Delivery */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                  <PackageCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">1. 100% Free Doorstep Delivery Nationwide</h2>
                  <p className="mt-2 text-xs leading-relaxed text-(--muted) sm:text-sm sm:leading-relaxed">
                    All Mountain Run packages with physical finisher rewards (heavyweight 3D die-cast medal, custom DRI-FIT event t-shirt, printed certificate) include <strong>100% Free Shipping</strong>. There are no hidden or extra delivery charges at checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Coverage */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">2. 19,000+ Indian PIN Codes Covered</h2>
                  <p className="mt-2 text-xs leading-relaxed text-(--muted) sm:text-sm sm:leading-relaxed">
                    We deliver across all 28 states and union territories in India—including major metros (Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad) as well as tier-2, tier-3 cities, rural towns, and Himalayan / North-Eastern hill states.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Dispatch & Transit Timeline */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">3. Dispatch &amp; Delivery Timelines</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-(--muted) sm:text-sm">
                    <li><strong className="text-foreground">Proof Verification:</strong> Your submitted GPS activity screenshot is verified by our arbiters within 24–48 hours of upload.</li>
                    <li><strong className="text-foreground">Kit Dispatch:</strong> Custom engraved finisher medals and t-shirts are packaged and dispatched via tracked couriers within <strong>7–10 business days</strong> after result approval.</li>
                    <li><strong className="text-foreground">Transit Duration:</strong> Metro deliveries typically take 2–4 days after dispatch; regional and non-metro pin codes take 4–7 business days.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Courier Partners & Live Tracking */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">4. Courier Partners &amp; Live Tracking</h2>
              <p className="mt-3">
                We partner with India&rsquo;s leading express logistics networks—including <strong>Delhivery</strong>, <strong>BlueDart</strong>, <strong>Shiprocket</strong>, and <strong>India Post (Speed Post)</strong> for remote locations.
              </p>
              <p className="mt-2">
                As soon as your parcel is handed over to the courier, an AWB tracking number will appear on your runner dashboard and will be sent via SMS / WhatsApp so you can track your parcel in real-time.
              </p>
            </div>

            {/* 5. Address Guidelines */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">5. Accurate Delivery Address Guidelines</h2>
              <p className="mt-3">
                To prevent failed delivery attempts or returns:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-(--muted) sm:text-sm">
                <li>Please provide a complete address with House/Flat No., Street, Nearby Landmark, and accurate 6-digit PIN code.</li>
                <li>Ensure your WhatsApp / phone number is active to receive courier OTP or delivery notifications.</li>
                <li>If you need to modify your shipping address, please contact support before your event result is verified.</li>
              </ul>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-between border-t border-(--line) pt-6">
            <Link href="/refund" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              <ArrowLeft className="h-4 w-4" /> Refund &amp; Cancellation
            </Link>
            <Link href="/policies" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              Back to Policy Center →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
