import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Virtual Run & Marathon Registration India 2026 | Register Online — Mountain Run",
  description:
    "Register for virtual marathons, 5K, 10K, and 21K Half Marathon challenges across India. Instant online registration with UPI/cards, authentic finisher medals, custom DRI-FIT t-shirts, and instant E-certificates.",
  keywords: [
    "virtual run registration",
    "virtual run registration India",
    "virtual marathon registration",
    "online marathon registration",
    "virtual race registration",
    "register for virtual run",
    "register for virtual marathon",
    "register for virtual race",
    "online running event registration",
    "virtual run booking",
    "virtual marathon booking",
    "join virtual run",
    "join virtual marathon",
    "5K run registration",
    "10K run registration",
    "21K run registration",
    "online run registration",
    "running event registration India",
  ],
  openGraph: {
    title: "Virtual Run & Marathon Registration India 2026 | Register Online — Mountain Run",
    description:
      "Register for virtual marathons, 5K, 10K, and 21K Half Marathon challenges across India. Get authentic finisher medals and instant E-certificates.",
    url: "/register",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/register`,
  },
};

export default function RegisterPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div aria-hidden className="pointer-events-none absolute top-8 right-8 flex gap-1.5 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-(--sage) animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="container-page py-6 sm:py-8 md:py-10">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Registration</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Join an event
            </h1>
            <p className="lede mx-auto mt-4 max-w-lg">
              Pick an event and distance, add shipping, and pay with UPI. Your races will appear on your dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-6 sm:pb-8 md:pb-10">
        <div className="container-page max-w-5xl">
          <PaymentRegistrationForm />
        </div>
      </section>
    </PageShell>
  );
}
