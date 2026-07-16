"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../../lib/admin-api";

const nav = [
  ["Overview", "/admin"],
  ["Events", "/admin/events"],
  ["Registrations", "/admin/registrations"],
  ["Payments", "/admin/payments"],
  ["Users", "/admin/users"],
  ["Proofs", "/admin/proofs"],
  ["Medals", "/admin/medals"],
  ["Certificates", "/admin/certificates"],
  ["Coupons", "/admin/coupons"],
] as const;

type AdminMe = {
  role?: string;
  name?: string;
  email?: string;
  mode?: string;
};

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
      // Wait briefly for Clerk session token after redirect from sign-in
      let token: string | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        token = await getToken().catch(() => null);
        if (token || !isSignedIn) {
          break;
        }
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
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoading(false);
      setMe(null);
      setError(null);
      return;
    }

    void loadMe();
  }, [isLoaded, isSignedIn, loadMe]);

  if (!isLoaded || (isSignedIn && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-center text-sm text-[var(--muted)]">
        <div>
          <p className="font-medium text-[var(--foreground)]">Loading admin…</p>
          <p className="mt-2 text-xs text-[var(--muted-soft)]">Checking your session and permissions.</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div className="card max-w-md p-8 text-center">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">Sign in required</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Sign in with your admin account to open the console. You will return here after login.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link className="btn btn-primary" href="/sign-in?redirect_url=/admin">
              Sign in
            </Link>
            <Link className="btn btn-ghost" href="/">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div className="card max-w-lg p-8 text-center">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">Access restricted</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {error ?? "Your account is signed in but is not an admin yet."}
          </p>
          <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-left text-xs leading-5 text-[var(--muted)]">
            <p className="font-medium text-[var(--foreground)]">How to get access</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>
                Backend <code className="rounded bg-white px-1">ADMIN_EMAILS</code> me apna email
                add karo (comma-separated).
              </li>
              <li>
                Ya Clerk Dashboard → User → publicMetadata:{" "}
                <code className="rounded bg-white px-1">{`{ "role": "admin" }`}</code>
              </li>
              <li>Ya DB me User.role = ADMIN / SUPER_ADMIN set karo.</li>
            </ol>
            {user?.primaryEmailAddress?.emailAddress ? (
              <p className="mt-3">
                Signed in as{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {user.primaryEmailAddress.emailAddress}
                </span>
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
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

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <nav className="flex flex-col gap-1 p-3">
      <div className="mb-4 px-2">
        <Link className="text-sm font-semibold tracking-tight" href="/admin">
          Mountain Run Admin
        </Link>
        <p className="mt-1 truncate text-xs text-[var(--muted)]">
          {me.name || user?.fullName || me.email || "Admin"}
        </p>
        <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted-soft)]">
          {me.role ?? "ADMIN"}
          {me.mode === "dev-bypass" ? " · dev" : ""}
        </p>
      </div>
      {nav.map(([label, href]) => (
        <Link
          className={`rounded-lg px-3 py-2.5 text-sm transition ${
            isActive(href)
              ? "bg-[var(--foreground)] text-white"
              : "text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
          }`}
          href={href}
          key={href}
          onClick={() => setMobileOpen(false)}
        >
          {label}
        </Link>
      ))}
      <div className="mt-4 border-t border-[var(--line)] pt-3">
        <Link
          className="block rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
          href="/"
        >
          View site
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="border-b border-[var(--line)] bg-white md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <span className="text-sm font-semibold">Admin</span>
          <button
            className="btn btn-secondary h-9 px-3"
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
        {mobileOpen ? <div className="border-t border-[var(--line)]">{sidebar}</div> : null}
      </div>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-[var(--line)] bg-white md:block">
          {sidebar}
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
