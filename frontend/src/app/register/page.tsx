import { PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

export default function RegisterPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-5 md:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--accent-dark)]">Event registration</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Register for Mountain Run.
          </h1>
          <p className="mt-5 leading-7 text-[var(--muted)]">
            Sign up / sign in first with email and password (Clerk). Then select distance,
            add delivery details, and pay securely with Razorpay. You will receive a
            confirmation email after payment.
          </p>
        </div>
        <PaymentRegistrationForm />
      </section>
    </PageShell>
  );
}
