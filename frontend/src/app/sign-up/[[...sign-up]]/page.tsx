"use client";

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { PageShell } from "../../components/app-shell";
import { useTheme } from "../../components/theme-provider";

function ThemedSignUp() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <SignUp
      fallbackRedirectUrl="/"
      forceRedirectUrl="/"
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      appearance={{
        variables: {
          colorPrimary: dark ? "#2dd4bf" : "#0d9488",
          colorBackground: dark ? "#121216" : "#ffffff",
          colorNeutral: dark ? "#a1a1aa" : "#64748b",
          borderRadius: "10px",
        },
        elements: {
          rootBox: "mx-auto w-full",
          cardBox: "w-full shadow-none",
          card: "w-full shadow-none rounded-2xl",
          footer: "hidden",
          formButtonPrimary: dark
            ? "bg-teal-500 hover:bg-teal-400 text-white normal-case"
            : "bg-slate-900 hover:bg-slate-800 text-white normal-case",
          formFieldInput: dark
            ? "bg-[#18181f] border-white/10 text-zinc-100"
            : "bg-white border-slate-200 text-slate-900",
          formFieldError: "text-red-500 text-xs mt-1",
          formFieldErrorText: dark ? "text-red-400" : "text-red-600",
          formFieldLabel: dark ? "text-zinc-300" : "text-slate-700",
          headerTitle: dark ? "text-zinc-100" : "text-slate-900",
          headerSubtitle: dark ? "text-zinc-400" : "text-slate-500",
          socialButtonsBlockButton: dark
            ? "border-white/10 bg-[#18181f] text-zinc-100 hover:bg-[#22222a]"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
          socialButtonsBlockButtonText: dark ? "text-zinc-300" : "text-slate-700",
          dividerLine: dark ? "bg-white/10" : "bg-slate-200",
          dividerText: dark ? "text-zinc-500" : "text-slate-400",
          formFieldAction: "text-teal-600 dark:text-teal-400",
          footerActionLink: "text-teal-600 dark:text-teal-400",
          formResendCodeLink: "text-teal-600 dark:text-teal-400",
          alert: dark
            ? "bg-red-900/20 border-red-800/30 text-red-300"
            : "bg-red-50 border-red-200 text-red-700",
        },
      }}
    />
  );
}

export default function SignUpPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page px-4">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <p className="eyebrow">Get started</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Create account
            </h1>
            <p className="mt-3 text-sm leading-6 text-(--muted)">
              Sign up with Google or email. You&apos;ll land on the homepage after.
            </p>
          </div>

          <div className="mx-auto mt-6 w-full max-w-[400px] sm:mt-8">
            <ClerkLoading>
              <div className="w-full rounded-2xl border border-(--line) bg-(--panel) p-6">
                <div className="h-5 w-36 rounded-full bg-(--panel-soft)" />
                <div className="mt-6 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-3 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-6 h-10 rounded-full bg-(--foreground)/10" />
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <ThemedSignUp />
            </ClerkLoaded>
          </div>

          <p className="mt-6 text-center text-sm text-(--muted)">
            Already have an account?{" "}
            <Link className="font-medium text-(--foreground) underline-offset-4 hover:underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
