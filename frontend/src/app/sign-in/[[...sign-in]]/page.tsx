

import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { PageShell } from "../../components/app-shell";

export default function SignInPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page px-4">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Sign in
            </h1>
            <p className="mt-3 text-sm leading-6 text-(--muted)">
              Use Google or your email and password.
            </p>
          </div>

          <div className="mx-auto mt-6 flex w-full max-w-[400px] justify-center sm:mt-8">
            <ClerkLoading>
              <div className="w-full rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-(--shadow)">
                <div className="h-5 w-32 rounded-full bg-(--panel-soft)" />
                <div className="mt-6 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-3 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-6 h-10 rounded-full bg-(--foreground)/10" />
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <SignIn
                fallbackRedirectUrl="/dashboard"
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                appearance={{
                  elements: {
                    rootBox: "mx-auto w-full",
                    cardBox: "w-full shadow-none",
                    card: "w-full shadow-none border border-(--line) rounded-2xl",
                    footer: "bg-transparent",
                  },
                }}
              />
            </ClerkLoaded>
          </div>

          <p className="mt-8 text-center text-sm text-(--muted)">
            New here?{" "}
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href="/sign-up"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
