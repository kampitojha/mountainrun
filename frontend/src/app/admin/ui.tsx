import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  kicker = "Admin",
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <p className="admin-kicker">{kicker}</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="admin-actions">{actions}</div> : null}
    </header>
  );
}

export function AdminPanel({
  title,
  subtitle,
  action,
  children,
  className = "",
  fill = false,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  fill?: boolean;
}) {
  return (
    <section
      className={`admin-panel admin-panel-pad ${fill ? "is-fill" : ""} ${className}`.trim()}
    >
      {title ? (
        <div className="admin-section-label">
          <div>
            <h2 className="admin-panel-title">{title}</h2>
            {subtitle ? <p className="admin-panel-sub">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={fill ? "admin-fill" : undefined}>{children}</div>
    </section>
  );
}

export function AdminStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="admin-stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="admin-link admin-muted" href={href}>
      ← {label}
    </Link>
  );
}
