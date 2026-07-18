import { PageHeader, PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

export default function RegisterPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page max-w-2xl">
          <PageHeader
            eyebrow="Registration"
            title="Register"
            description="Fill your details, pick event & distance, add shipping, and pay with UPI."
          />
          <PaymentRegistrationForm />
        </div>
      </section>
    </PageShell>
  );
}
