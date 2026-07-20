import { PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

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

        <div className="container-page py-10 sm:py-12 md:py-14">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Registration</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl">
              Join an event
            </h1>
            <p className="lede mx-auto mt-4 max-w-lg">
              Pick an event and distance, add shipping, and pay with UPI. Your races will appear on your dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-page max-w-3xl">
          <PaymentRegistrationForm />
        </div>
      </section>
    </PageShell>
  );
}
