import Link from "next/link";
import { Field, PageShell, inputClass, primaryLinkClass } from "../components/app-shell";

export default function SignInPage() {
  return (
    <PageShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-5 md:grid-cols-[1fr_440px] md:py-16">
        <div className="self-center">
          <p className="text-sm font-semibold text-[var(--accent-dark)]">Runner access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Sign in to manage your run.</h1>
          <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
            Check registration status, upload GPS proof, download certificates, and track medal delivery from one place.
          </p>
        </div>
        <form action="/admin" className="rounded-lg border hairline bg-[var(--panel)] p-5 soft-shadow">
          <div className="grid gap-4">
            <Field label="Email">
              <input className={inputClass} name="email" placeholder="runner@example.com" type="email" required />
            </Field>
            <Field label="Password">
              <input className={inputClass} name="password" placeholder="Enter password" type="password" required />
            </Field>
            <button className={primaryLinkClass} type="submit">Sign in</button>
            <Link className="text-center text-sm font-medium text-[var(--accent-dark)]" href="/register">
              New runner? Create registration
            </Link>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
