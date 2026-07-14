import { SignUp } from "@clerk/nextjs";
import { PageShell } from "../../components/app-shell";

export default function SignUpPage() {
  return (
    <PageShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-5 md:grid-cols-[1fr_440px] md:py-16">
        <div className="self-center">
          <p className="text-sm font-semibold text-[var(--accent-dark)]">Create account</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign up with email and password.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
            Create your runner account first (email + password). After sign-up you can
            register for an event and complete payment.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border hairline rounded-lg w-full",
              },
            }}
            fallbackRedirectUrl="/register"
            signInUrl="/sign-in"
          />
        </div>
      </section>
    </PageShell>
  );
}
