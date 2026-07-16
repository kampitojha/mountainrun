"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const publicNav = [
  ["Events", "/events"],
  ["Gallery", "/gallery"],
  ["About", "/about"],
  ["Leaderboard", "/leaderboard"],
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 top-0.5 block h-px w-5 bg-current transition ${
          open ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[9px] block h-px w-5 bg-current transition ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[15px] block h-px w-5 bg-current transition ${
          open ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      className={`nav-link ${active ? "is-active" : ""}`}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function ProfileButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-9 w-9",
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link label="My dashboard" href="/dashboard" labelIcon={<IconHome />} />
        <UserButton.Link label="Register for event" href="/register" labelIcon={<IconRun />} />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}

function IconHome() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function IconRun() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M13 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 21l3-7 3 2 3-6" />
      <path d="m9 12 3 2" />
    </svg>
  );
}

function BrandLogo({
  onNavigate,
  onDark,
}: {
  onNavigate?: () => void;
  onDark?: boolean;
}) {
  return (
    <Link
      aria-label="Mountain Run home"
      className="group flex shrink-0 items-center gap-2 sm:gap-2.5"
      href="/"
      onClick={onNavigate}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="brand-mark block shrink-0"
        height={36}
        src="/logo-mark.svg"
        width={36}
      />
      <span
        className={`text-[0.95rem] font-semibold tracking-tight sm:text-base ${
          onDark ? "text-white" : "text-[var(--foreground)]"
        }`}
      >
        Mountain Run
      </span>
    </Link>
  );
}

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // On home at top: transparent over hero. Elsewhere always glass.
  const atHeroTop = isHome && !scrolled && !open;
  const headerClass = `site-header ${atHeroTop ? "is-top" : "is-scrolled"}`;
  const onDark = atHeroTop;

  return (
    <header className={headerClass}>
      <div className="container-page">
        <div className="header-inner flex items-center justify-between gap-2 sm:gap-4">
          <BrandLogo onDark={onDark} onNavigate={() => setOpen(false)} />

          <nav
            className={`hidden items-center gap-0.5 md:flex ${
              onDark ? "[&_.nav-link]:text-white/70 [&_.nav-link.is-active]:text-white [&_.nav-link:hover]:text-white" : ""
            }`}
          >
            {publicNav.map(([label, href]) => (
              <NavLink active={isActive(href)} href={href} key={href} label={label} />
            ))}
            <Show when="signed-in">
              <NavLink
                active={isActive("/dashboard")}
                href="/dashboard"
                label="Dashboard"
              />
            </Show>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <Show when="signed-out">
                <Link
                  className={`btn h-9 px-3 ${onDark ? "btn-on-dark" : "btn-ghost"}`}
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Link className="btn btn-primary h-9 px-4" href="/events">
                  Join a run
                </Link>
              </Show>
              <Show when="signed-in">
                <ProfileButton />
              </Show>
            </div>

            <div className="flex items-center gap-1.5 md:hidden">
              <Show when="signed-in">
                <ProfileButton />
              </Show>
              <button
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                className={`focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                  onDark
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-[var(--line)] bg-white text-[var(--foreground)]"
                }`}
                onClick={() => setOpen((value) => !value)}
                type="button"
              >
                <MenuIcon open={open} />
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
          <button
            aria-hidden={!open}
            className={`fixed inset-0 top-14 z-30 bg-black/25 transition-opacity sm:top-16 ${
              open ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            type="button"
          />

          <div
            className={`relative z-40 overflow-hidden transition-[max-height,opacity,padding] duration-200 ${
              open ? "max-h-[min(28rem,70vh)] pb-4 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="grid gap-1 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-hover)]">
              {publicNav.map(([label, href]) => (
                <Link
                  className={`rounded-xl px-3 py-3.5 text-sm font-medium transition active:scale-[0.99] ${
                    isActive(href)
                      ? "bg-[var(--foreground)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
                  }`}
                  href={href}
                  key={href}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Show when="signed-in">
                <Link
                  className={`rounded-xl px-3 py-3.5 text-sm font-medium transition ${
                    isActive("/dashboard")
                      ? "bg-[var(--foreground)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
                  }`}
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  className="rounded-xl px-3 py-3.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
                  href="/register"
                  onClick={() => setOpen(false)}
                >
                  Join event
                </Link>
              </Show>
              <Show when="signed-out">
                <div className="mt-1 grid grid-cols-1 gap-2 border-t border-[var(--line)] pt-2 sm:grid-cols-2">
                  <Link
                    className="btn btn-secondary h-11 w-full"
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    className="btn btn-primary h-11 w-full"
                    href="/events"
                    onClick={() => setOpen(false)}
                  >
                    Join a run
                  </Link>
                </div>
              </Show>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
