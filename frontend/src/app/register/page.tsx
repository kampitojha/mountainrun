import { PageHeader, PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

export default function RegisterPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page w-full max-w-3xl px-4 sm:px-0">
          <PageHeader
            eyebrow="Registration"
            title="Join an event"
            description="Pick event and distance, add shipping, pay with UPI. After login your races also show on Dashboard."
          />
          <PaymentRegistrationForm />
        </div>
      </section>
    </PageShell>
  );
}
