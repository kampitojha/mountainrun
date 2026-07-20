import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <AppHeader />
      {/* pt compensates for fixed navbar height (~56px mobile, ~64px desktop + 12px top offset) */}
      <main className="flex-1 pt-[4.5rem] sm:pt-[5rem] md:pt-[5.5rem]">{children}</main>
      <AppFooter />
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
