import Link from "next/link";
import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";

export function MinimalFooter() {
  return (
    <footer className="border-t border-(--line) bg-(--panel-soft)/30 py-4 px-4 text-xs text-(--muted)">
      <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-2.5 max-w-5xl mx-auto text-center sm:text-left">
        <p className="text-[0.7rem] sm:text-xs">
          © {new Date().getFullYear()} Mountain Run. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 font-medium text-[0.7rem] sm:text-xs">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
          <span className="text-(--muted-soft)">·</span>
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms
          </Link>
          <span className="text-(--muted-soft)">·</span>
          <Link href="/refund" className="hover:text-foreground hover:underline">
            Refunds
          </Link>
          <span className="text-(--muted-soft)">·</span>
          <Link href="/shipping" className="hover:text-foreground hover:underline">
            Shipping
          </Link>
          <span className="text-(--muted-soft)">·</span>
          <a
            href="mailto:mountainrunofficial@gmail.com"
            className="hover:text-(--sage) hover:underline"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  footerMode = "full",
}: {
  children: React.ReactNode;
  footerMode?: "full" | "minimal" | "none";
}) {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <AppHeader />
      {/* pt compensates for fixed navbar height (~56px mobile, ~64px desktop + 12px offset) */}
      <main className="flex-1 pt-[4.5rem] sm:pt-[5rem] md:pt-[5.5rem]">{children}</main>
      {footerMode === "full" ? (
        <AppFooter />
      ) : footerMode === "minimal" ? (
        <MinimalFooter />
      ) : null}
    </div>
  );
}

export { AppFooter } from "./app-footer";

export function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-[var(--danger)]">
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className={`display ${eyebrow ? "mt-3 sm:mt-4" : ""}`}>{title}</h1>
        {description ? <p className="lede mt-3 max-w-xl sm:mt-4">{description}</p> : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}

export const inputClass = "input";
export const primaryLinkClass = "btn btn-primary";
export const secondaryLinkClass = "btn btn-secondary";
