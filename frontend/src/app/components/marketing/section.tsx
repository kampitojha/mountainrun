import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

export function MarketingSection({
  children,
  className,
  id,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "default" | "soft" | "dark" | "white";
}) {
  return (
    <section
      className={cn(
        "relative py-16 sm:py-20 lg:py-24",
        tone === "soft" && "bg-[var(--panel-soft)]/80",
        tone === "white" && "bg-white",
        tone === "dark" && "bg-[var(--foreground)] text-white",
        className,
      )}
      id={id}
    >
      {children}
    </section>
  );
}

export function MarketingContainer({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        wide ? "max-w-7xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionEyebrow({
  children,
  className,
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
        light ? "text-white/55" : "text-[var(--muted)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <h2
      className={cn(
        "mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
        light ? "text-white" : "text-[var(--foreground)]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SectionLead({
  children,
  className,
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p
      className={cn(
        "mt-4 max-w-2xl text-base leading-7 sm:text-lg",
        light ? "text-white/70" : "text-[var(--muted)]",
        className,
      )}
    >
      {children}
    </p>
  );
}
