import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck, HelpCircle, Lock, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Policy Center & Legal Hub | Mountain Run India",
  description:
    "Explore Mountain Run official policies, terms of service, privacy guidelines, refund and cancellation rules, and shipping & delivery information for virtual running events across India.",
  keywords: [
    "mountain run policies",
    "virtual marathon terms of service",
    "virtual run refund policy",
    "marathon medal shipping policy",
    "mountain run privacy policy",
  ],
  openGraph: {
    title: "Policy Center & Legal Hub | Mountain Run India",
    description:
      "Official policies, terms, refund, and shipping guidelines for Mountain Run virtual marathons and events.",
    url: "/policies",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/policies`,
  },
};

const policyCards = [
  {
    title: "Privacy Policy",
    href: "/privacy",
    icon: Lock,
    description:
      "Learn how we collect, use, and protect your personal details, GPS run activity data, and payment information with bank-grade encryption.",
    tag: "Data Protection & Privacy",
  },
  {
    title: "Terms of Service",
    href: "/terms",
    icon: FileCheck,
    description:
      "The terms and conditions governing participation in Mountain Run virtual events, GPS proof verification, leaderboards, and user conduct.",
    tag: "Rules & Guidelines",
  },
  {
    title: "Refund & Cancellation",
    href: "/refund",
    icon: RefreshCw,
    description:
      "Clear, transparent guidelines regarding event entry cancellations, medal replacements for damaged items, and refund processing timelines.",
    tag: "Fair Return Policy",
  },
  {
    title: "Shipping & Delivery",
    href: "/shipping",
    icon: Truck,
    description:
      "Everything about our nationwide doorstep delivery across 19,000+ Indian pincodes, dispatch timelines, and live courier tracking.",
    tag: "Free Pan-India Delivery",
  },
];

export default function PolicyCenterPage() {
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
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Header */}
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
              { name: "Policy Center", href: "/policies" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-8">
            <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-3 py-1 text-xs font-semibold text-(--sage)">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust, Security &amp; Transparency
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Policy Center &amp; Legal
            </h1>
            <p className="lede mx-auto mt-4 max-w-xl text-(--muted)">
              We believe in complete transparency. Review our official policies on privacy, terms of participation, refunds, and pan-India shipping.
            </p>
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="section border-b border-(--line)">
        <div className="container-page max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {policyCards.map(({ title, href, icon: Icon, description, tag }) => (
              <Link
                key={title}
                href={href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--line) bg-(--panel) p-6 transition-all duration-300 hover:border-(--sage)/50 hover:bg-(--panel-soft) hover:shadow-lg sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--sage-soft) text-(--sage) transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <span className="rounded-full border border-(--line) bg-background px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-(--muted-soft)">
                      {tag}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-foreground transition-colors group-hover:text-(--sage)">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    {description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-(--sage)">
                  Read complete policy
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Contact Support Box */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-(--line) bg-(--panel) p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--sage-soft) text-(--sage)">
                  <HelpCircle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-foreground">Have questions or grievance?</h3>
                  <p className="mt-1 text-xs text-(--muted) sm:text-sm">
                    Our compliance team and runners support desk are always here to help you.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:mountainrunofficial@gmail.com"
                  className="btn btn-secondary text-xs sm:text-sm"
                >
                  Email Support
                </a>
                <a
                  href="https://wa.me/917518418960"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-xs sm:text-sm"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
