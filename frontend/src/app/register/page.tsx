import { PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

export default function RegisterPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden section">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 10% 0%, color-mix(in srgb, var(--sage) 12%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 10%, rgba(99,102,241,0.08), transparent 50%)",
          }}
        />
        <div className="container-page max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--panel)/80 px-3 py-1 shadow-xs backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-(--sage)" />
              Registration
            </p>
            <h1 className="display mt-4 sm:mt-5">Join a mountain run</h1>
            <p className="lede mx-auto mt-3 max-w-lg">
              Pick your event, choose a distance, add delivery details, and pay securely with UPI.
              Track everything later on your dashboard.
            </p>
          </div>
          <PaymentRegistrationForm />
        </div>
      </section>
    </PageShell>
  );
}
