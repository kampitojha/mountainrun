import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Mountain Run India",
  description:
    "Understand Mountain Run official policies regarding event registration cancellation, free medal replacements for damaged parcels, and UPI refund processing timelines.",
  keywords: [
    "mountain run refund policy",
    "virtual marathon cancellation india",
    "marathon registration refund",
    "medal replacement policy",
  ],
  openGraph: {
    title: "Refund & Cancellation Policy | Mountain Run India",
    description:
      "Transparent refund, cancellation, and damaged medal replacement guidelines for Mountain Run.",
    url: "/refund",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/refund`,
  },
};

export default function RefundPolicyPage() {
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
        name: "Refund & Cancellation",
        item: `${SITE_URL}/refund`,
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
              { name: "Refund & Cancellation", href: "/refund" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-3xl text-center sm:mt-8">
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-3 py-1 text-xs font-semibold text-(--sage)">
              <RefreshCw className="h-3.5 w-3.5" />
              Fair &amp; Transparent Policy
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="lede mx-auto mt-3 max-w-xl text-(--muted)">
              Last updated: August 2026 · We strive to deliver a flawless runner experience with straightforward, honest terms.
            </p>
          </div>
        </div>
      </section>

      {/* Refund Content */}
      <section className="section border-b border-(--line)">
        <div className="container-page max-w-3xl">
          <div className="space-y-10 text-sm leading-relaxed text-(--muted) sm:text-base sm:leading-relaxed">

            {/* 1. Cancellation Window */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">1. Event Registration Cancellation</h2>
              <p className="mt-3">
                We understand plans change. You can request a cancellation and full refund of your event registration fee under the following condition:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Cancellation request is sent within <strong>24 hours of payment</strong> and before the event run window has officially begun.</li>
                <li>Once customized bibs, engraved finisher medals, or custom DRI-FIT t-shirts have entered the production/dispatch pipeline, registration fees become non-refundable.</li>
              </ul>
            </div>

            {/* 2. Free Replacement for Damaged Items */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">2. 100% Free Replacement for Transit Damage</h2>
                  <p className="mt-2 text-xs leading-relaxed text-(--muted) sm:text-sm sm:leading-relaxed">
                    If your physical finisher medal, t-shirt, or kit arrives damaged, broken, or defective due to courier handling, we will dispatch a brand-new replacement immediately at <strong>zero extra charge</strong>.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-(--muted) sm:text-sm sm:leading-relaxed">
                    Simply share a clear photo or short video of the damaged item on WhatsApp (+91 7518 418 960) or email within 48 hours of parcel delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Non-Refundable Cases */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">3. Non-Refundable Circumstances</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-(--muted) sm:text-sm">
                    <li>Failure to complete the registered distance during the designated event period.</li>
                    <li>Rejection of activity proof due to intentional GPS spoofing, motorized vehicle use, or false records.</li>
                    <li>Failure of courier delivery due to an incorrect, incomplete, or unserviceable address entered by the participant.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Refund Processing Timeline */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">4. Refund Timeline &amp; Payment Mode</h2>
              <p className="mt-3">
                Approved refunds are credited directly back to the original source of payment (UPI, Credit/Debit Card, Net Banking, or Wallet) via Razorpay.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li><strong>UPI &amp; Wallets:</strong> Usually processed within 24–48 banking hours.</li>
                <li><strong>Credit / Debit Cards &amp; Net Banking:</strong> 5–7 business days depending on your bank&rsquo;s clearance cycle.</li>
              </ul>
            </div>

            {/* 5. How to Contact */}
            <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">5. How to Initiate a Request</h2>
              <p className="mt-3">
                To submit a cancellation or replacement request, please contact our runner support with your <strong>Bib Number / Order ID</strong>:
              </p>
              <div className="mt-4 rounded-xl border border-(--line) bg-(--panel-soft) p-4 text-xs sm:text-sm space-y-1">
                <p>Email: <a href="mailto:mountainrunofficial@gmail.com" className="text-(--sage) underline">mountainrunofficial@gmail.com</a></p>
                <p>WhatsApp Helpdesk: <a href="https://wa.me/917518418960" target="_blank" rel="noopener noreferrer" className="text-(--sage) underline">+91 7518 418 960</a></p>
                <p className="text-(--muted-soft)">Operating Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST</p>
              </div>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-between border-t border-(--line) pt-6">
            <Link href="/terms" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              <ArrowLeft className="h-4 w-4" /> Terms of Service
            </Link>
            <Link href="/shipping" className="inline-flex items-center gap-1.5 text-xs font-bold text-(--sage) hover:underline sm:text-sm">
              Shipping &amp; Delivery Policy →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
