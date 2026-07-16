"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../../lib/admin-api";
import "./admin.css";

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [{ label: "Overview", href: "/admin", icon: "grid" }],
  },
  {
    label: "Operations",
    items: [
      { label: "Events", href: "/admin/events", icon: "flag" },
      { label: "Registrations", href: "/admin/registrations", icon: "list" },
      { label: "Proofs", href: "/admin/proofs", icon: "check" },
    ],
  },
  {
    label: "Finance",
    items: [{ label: "Payments", href: "/admin/payments", icon: "card" }],
  },
  {
    label: "People",
    items: [{ label: "Users", href: "/admin/users", icon: "users" }],
  },
  {
    label: "Fulfillment",
    items: [
      { label: "Medals", href: "/admin/medals", icon: "medal" },
      { label: "Certificates", href: "/admin/certificates", icon: "doc" },
    ],
  },
  {
    label: "Growth",
    items: [{ label: "Coupons", href: "/admin/coupons", icon: "tag" }],
  },
];

type AdminMe = {
  role?: string;
  name?: string;
  email?: string;
  mode?: string;
};

function NavIcon({ name }: { name: string }) {
  const common = {
    className: "admin-nav-icon",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  } as const;

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M5 21V4h9l-1.2 3.5L16 11H5" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4.5 4.5L19 7" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect height="14" rx="2" width="18" x="3" y="5" />
          <path d="M3 10h18" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3.5" />
          <path d="M20 21v-2a3.5 3.5 0 0 0-2.5-3.35" />
          <path d="M16 3.6a3.5 3.5 0 0 1 0 6.8" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <circle cx="12" cy="14" r="5" />
          <path d="M9 9 8 3h8l-1 6" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7V3Z" />
          <path d="M14 3v4h4M10 12h5M10 16h5" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M20 12 12 4H5v7l8 8 7-7Z" />
          <circle cx="8.5" cy="8.5" r="1" />
        </svg>
      );
    default:
      return <span className="admin-nav-icon" />;
  }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let token: string | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        token = await getToken().catch(() => null);
        if (token || !isSignedIn) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      const json = await adminFetch<{ data: AdminMe }>("/api/admin/me", token);
      setMe(json.data);
    } catch (err) {
      setMe(null);
      setError(err instanceof Error ? err.message : "Admin access denied");
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      setMe(null);
      setError(null);
      return;
    }
    void loadMe();
  }, [isLoaded, isSignedIn, loadMe]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  if (!isLoaded || (isSignedIn && loading)) {
    return (
      <div className="admin-app admin-gate">
        <div className="admin-gate-card">
          <p className="admin-kicker">Admin</p>
          <h1>Loading console</h1>
          <p>Checking session and permissions…</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="admin-app admin-gate">
        <div className="admin-gate-card">
          <p className="admin-kicker">Admin</p>
          <h1>Sign in required</h1>
          <p>Use an admin account. You will return to this console after login.</p>
          <div className="admin-actions" style={{ justifyContent: "center", marginTop: "1.25rem" }}>
            <Link className="btn btn-primary" href="/sign-in?redirect_url=/admin">
              Sign in
            </Link>
            <Link className="btn btn-secondary" href="/">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="admin-app admin-gate">
        <div className="admin-gate-card">
          <p className="admin-kicker">Admin</p>
          <h1>Access restricted</h1>
          <p>{error ?? "Signed in, but this account is not an admin."}</p>
          <div className="admin-help">
            <strong style={{ color: "var(--admin-ink)" }}>Grant access</strong>
            <ol>
              <li>
                Set <code>ADMIN_EMAILS</code> on the API
              </li>
              <li>
                Or Clerk metadata <code>{`{ "role": "admin" }`}</code>
              </li>
              <li>
                Or DB <code>User.role = ADMIN</code>
              </li>
            </ol>
            {user?.primaryEmailAddress?.emailAddress ? (
              <p style={{ marginTop: "0.65rem" }}>
                Signed in as <strong>{user.primaryEmailAddress.emailAddress}</strong>
              </p>
            ) : null}
          </div>
          <div className="admin-actions" style={{ justifyContent: "center", marginTop: "1.25rem" }}>
            <button className="btn btn-secondary" onClick={() => void loadMe()} type="button">
              Retry
            </button>
            <Link className="btn btn-ghost" href="/">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = me.name || user?.fullName || me.email || "Admin";
  const initial = displayName.slice(0, 1).toUpperCase();

  const navBody = (
    <>
      <div className="admin-sidebar-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" height={28} src="/logo-mark.svg" width={28} />
        <div className="admin-sidebar-brand-text">
          <strong>Mountain Run</strong>
          <span>Operations</span>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Admin">
        {navGroups.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <div className="admin-nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                className={`admin-nav-link ${isActive(item.href) ? "is-active" : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => setMobileOpen(false)}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-foot">
        <div className="admin-user-chip">
          <div className="avatar">{initial}</div>
          <div className="meta">
            <strong>{displayName}</strong>
            <span>
              {me.role ?? "ADMIN"}
              {me.mode === "dev-bypass" ? " · dev" : ""}
            </span>
          </div>
        </div>
        <div className="admin-sidebar-links">
          <Link href="/">View site</Link>
          <Link href="/dashboard">My dashboard</Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-app">
      <div className="admin-mobile-bar">
        <div>
          <strong style={{ fontSize: "0.875rem" }}>Admin</strong>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setMobileOpen((value) => !value)}
          type="button"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>
      {mobileOpen ? <div className="admin-mobile-drawer">{navBody}</div> : null}

      <div className="admin-shell">
        <aside className="admin-sidebar">{navBody}</aside>
        <main className="admin-main">
          <div className="admin-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
