import { AppHeader } from "./app-header";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="premium-shell min-h-screen">
      <AppHeader />
      {children}
    </main>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "focus-ring h-11 w-full rounded-lg border hairline bg-white px-3 text-sm text-[var(--foreground)]";

export const primaryLinkClass =
  "focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]";
