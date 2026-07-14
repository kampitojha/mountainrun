"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  ["Events", "/events"],
  ["Leaderboard", "/leaderboard"],
  ["Register", "/register"],
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 top-1 block h-0.5 w-5 rounded-full bg-current transition ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-2.5 block h-0.5 w-5 rounded-full bg-current transition ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-4 block h-0.5 w-5 rounded-full bg-current transition ${
          open ? "-translate-y-1.5 -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-[rgba(247,246,242,0.9)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-5">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <Link className="flex min-w-0 items-center gap-3" href="/" onClick={() => setOpen(false)}>
            <Image className="h-10 w-auto shrink-0" src="/logo.svg" alt="Mountain Run" width={157} height={40} priority />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(([label, href]) => (
              <Link
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  pathname === href
                    ? "bg-white text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]"
                }`}
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-white hover:text-[var(--foreground)]"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="rounded-lg bg-[var(--foreground)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
              href="/register"
            >
              Register
            </Link>
          </div>

          <button
            aria-expanded={open}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border hairline bg-white text-[var(--foreground)] md:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <MenuIcon open={open} />
          </button>
        </div>

        <div
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-200 md:hidden ${
            open ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="grid gap-1 rounded-lg border hairline bg-[var(--panel)] p-2 soft-shadow">
            {navItems.map(([label, href]) => (
              <Link
                className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                  pathname === href
                    ? "bg-[var(--foreground)] text-white"
                    : "text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]"
                }`}
                href={href}
                key={href}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t hairline pt-2">
              <Link
                className="rounded-lg border hairline bg-white px-3 py-3 text-center text-sm font-semibold text-[var(--foreground)]"
                href="/sign-in"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link
                className="rounded-lg bg-[var(--foreground)] px-3 py-3 text-center text-sm font-semibold text-white"
                href="/register"
                onClick={() => setOpen(false)}
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
