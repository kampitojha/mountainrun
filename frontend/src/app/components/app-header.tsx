"use client";

import { Show, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Image as ImageIcon,
  Info,
  Trophy,
  LayoutDashboard,
  Award,
  LogIn,
  ChevronDown,
  Settings,
  LogOut,
  CalendarDays,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const publicNav = [
  ["Events", "/events", Calendar],
  ["Gallery", "/gallery", ImageIcon],
  ["About", "/about", Info],
  ["Leaderboard", "/leaderboard", Trophy],
] as const;

/* ─── Custom Profile Dropdown ─── */
function ProfileDropdown() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const name = user?.fullName ?? user?.firstName ?? "Account";
  const username = user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = user?.imageUrl;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 rounded-full border border-(--line) bg-(--panel) px-1.5 py-1 pr-2.5 transition-all duration-200 hover:border-(--line-strong) hover:bg-(--panel-soft) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sage)/40 cursor-pointer"
      >
        {/* Avatar */}
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 text-[0.65rem] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[96px] truncate text-xs font-semibold text-(--foreground) sm:block">
          {name}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-(--muted) transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 origin-top-right overflow-hidden rounded-2xl border border-(--line-strong) bg-(--panel) shadow-[0_20px_40px_-8px_rgba(0,0,0,0.12),0_8px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.5)]"
          >
            {/* User info header */}
            <div className="flex items-center gap-3 border-b border-(--line) bg-(--panel-soft) px-3.5 py-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-(--line)"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 text-sm font-bold text-white">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-(--foreground)">{name}</p>
                <p className="truncate text-xs text-(--muted)">{username}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--panel-soft)"
              >
                <LayoutDashboard className="h-4 w-4 text-(--muted)" />
                My dashboard
              </Link>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--panel-soft)"
              >
                <CalendarDays className="h-4 w-4 text-(--muted)" />
                Browse events
              </Link>
              <button
                type="button"
                onClick={() => { setOpen(false); openUserProfile(); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--panel-soft)"
              >
                <Settings className="h-4 w-4 text-(--muted)" />
                Manage account
              </button>

              <div className="my-1.5 h-px bg-(--line)" />

              <button
                type="button"
                onClick={() => { setOpen(false); void signOut(() => router.push("/")); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--danger) transition-colors hover:bg-(--danger)/8"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Nav link with active pill ─── */
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
      className={`relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
        active ? "text-(--foreground)" : "text-(--muted) hover:text-(--foreground)"
      }`}
      href={href}
      onClick={onClick}
    >
      {active && (
        <motion.span
          layoutId="active-nav-pill"
          className="absolute inset-0 -z-10 rounded-full border border-(--line) bg-(--panel) shadow-xs"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
      {label}
    </Link>
  );
}

/* ─── Brand logo ─── */
function BrandLogo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      aria-label="Mountain Run home"
      className="group flex shrink-0 items-center gap-2 sm:gap-2.5"
      href="/"
      onClick={onNavigate}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Mountain Run logo"
        className="block h-8 w-8 shrink-0 sm:h-9 sm:w-9 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
        height={36}
        src="/logo-mark.svg"
        width={36}
      />
      <span className="text-base font-semibold tracking-tight text-(--foreground) sm:text-lg">
        Mountain{" "}
        <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text font-extrabold text-transparent">
          Run
        </span>
      </span>
    </Link>
  );
}

/* ─── Hamburger ─── */
function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-(--line) bg-(--panel) text-(--foreground) transition-all duration-200 hover:border-(--sage)/40 hover:bg-(--sage-soft) hover:shadow-sm active:scale-90"
      onClick={onClick}
      type="button"
    >
      {open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 rounded-2xl bg-(--sage-soft)"
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="relative h-4 w-4">
        <motion.span
          className="absolute left-0 block h-[2.5px] rounded-full bg-current"
          animate={open
            ? { top: 7, rotate: 45, width: 18, left: -1 }
            : { top: 1.5, rotate: 0, width: 16, left: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        />
        <motion.span
          className="absolute left-0 block h-[2.5px] rounded-full bg-current"
          animate={open
            ? { opacity: 0, width: 0, top: 7 }
            : { opacity: 1, width: 12, top: 7 }}
          transition={{ duration: 0.15 }}
        />
        <motion.span
          className="absolute left-0 block h-[2.5px] rounded-full bg-current"
          animate={open
            ? { top: 7, rotate: -45, width: 18, left: -1 }
            : { top: 12.5, rotate: 0, width: 16, left: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        />
      </div>
    </button>
  );
}

/* ─── Mobile user card ─── */
function MobileUserCard({ onNavigate }: { onNavigate: () => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const name = user?.fullName ?? user?.firstName ?? "Runner";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarUrl = user?.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 26 }}
      className="mb-4 flex items-center gap-3 rounded-2xl border border-(--line) bg-(--panel-soft) p-3"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-(--line)" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 text-sm font-bold text-white ring-2 ring-(--line)">
          {initials}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold tracking-tight text-(--foreground)">{name}</p>
        <p className="truncate text-xs text-(--muted)">{email}</p>
      </div>
      <button
        type="button"
        onClick={() => { onNavigate(); void signOut(() => router.push("/")); }}
        title="Sign out"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--line) bg-(--panel) text-(--muted) transition-colors hover:border-red-300 hover:text-red-500 active:scale-90"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

/* ─── Main header ─── */
export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-(--line) bg-(--header-bg) shadow-xs backdrop-blur-xl">
      <div className="h-[2px] w-full bg-gradient-to-r from-(--sage) via-emerald-400 to-indigo-500" />

      <div className="container-page">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          <BrandLogo onNavigate={() => setOpen(false)} />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {publicNav.map(([label, href]) => (
              <NavLink active={isActive(href)} href={href} key={href} label={label} />
            ))}
            <Show when="signed-in">
              <NavLink active={isActive("/dashboard")} href="/dashboard" label="Dashboard" />
            </Show>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle size="sm" />

            {/* Desktop auth */}
            <div className="hidden items-center gap-2 md:flex">
              <Show when="signed-out">
                <Link className="btn btn-ghost h-9 px-3 text-sm" href="/sign-in">
                  Sign in
                </Link>
                <Link className="btn btn-primary h-9 px-4 text-sm" href="/events">
                  Browse events
                </Link>
              </Show>
              <Show when="signed-in">
                <ProfileDropdown />
              </Show>
            </div>

            {/* Mobile auth */}
            <div className="flex items-center gap-1.5 md:hidden">
              <Show when="signed-in">
                <ProfileDropdown />
              </Show>
              <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer — slide-in from right */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-(--overlay) backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-l border-(--line) bg-(--panel) shadow-2xl md:hidden"
            >
              {/* Drawer header with sage accent */}
              <div className="relative flex items-center justify-between px-4 py-4">
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-(--sage)/20 to-transparent" />
                <BrandLogo onNavigate={() => setOpen(false)} />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--muted) transition-all duration-200 hover:border-(--sage)/40 hover:bg-(--sage-soft) hover:text-(--sage) active:scale-90"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-3 py-3">
                {/* User card (signed in) */}
                <Show when="signed-in">
                  <MobileUserCard onNavigate={() => setOpen(false)} />
                </Show>

                {/* Nav links */}
                <nav className="flex flex-col gap-1">
                  {publicNav.map(([label, href, Icon], i) => {
                    const active = isActive(href);
                    return (
                      <motion.div
                        key={href}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, type: "spring", stiffness: 300, damping: 26 }}
                      >
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                            active
                              ? "bg-(--sage-soft) text-(--sage)"
                              : "text-(--muted) hover:bg-(--sage-soft)/40 hover:text-(--foreground)"
                          }`}
                        >
                          {active && (
                            <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-(--sage)" />
                          )}
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                            active
                              ? "bg-(--sage) text-white shadow-sm"
                              : "bg-(--panel-soft) text-(--muted-soft) group-hover:bg-(--line)"
                          }`}>
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="flex-1">{label}</span>
                          <svg className={`h-4 w-4 transition-all group-hover:translate-x-0.5 ${active ? "text-(--sage)" : "text-(--muted-soft)"}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 4 4 4-4 4" />
                          </svg>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Dashboard link (signed in) */}
                  <Show when="signed-in">
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * (publicNav.length + 1), type: "spring", stiffness: 300, damping: 26 }}
                    >
                      <div className="my-2 mx-3 h-px bg-gradient-to-r from-(--line) via-(--line) to-transparent" />
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                          isActive("/dashboard")
                            ? "bg-(--sage-soft) text-(--sage)"
                            : "text-(--muted) hover:bg-(--sage-soft)/40 hover:text-(--foreground)"
                        }`}
                      >
                        {isActive("/dashboard") && (
                          <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-(--sage)" />
                        )}
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          isActive("/dashboard")
                            ? "bg-(--sage) text-white shadow-sm"
                            : "bg-(--panel-soft) text-(--muted-soft) group-hover:bg-(--line)"
                        }`}>
                          <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="flex-1">Dashboard</span>
                        <svg className={`h-4 w-4 transition-all group-hover:translate-x-0.5 ${isActive("/dashboard") ? "text-(--sage)" : "text-(--muted-soft)"}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 4 4 4-4 4" />
                        </svg>
                      </Link>
                    </motion.div>
                  </Show>
                </nav>
              </div>

              {/* Drawer footer with sage accent */}
              <div className="relative border-t border-(--line) px-4 py-4">
                <Show when="signed-out">
                  <div className="flex flex-col gap-2 pb-3">
                    <Link
                      className="btn btn-primary h-10 w-full text-sm justify-center"
                      href="/events"
                      onClick={() => setOpen(false)}
                    >
                      Browse events
                    </Link>
                    <Link
                      className="btn btn-secondary h-10 w-full text-sm justify-center"
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </Link>
                  </div>
                </Show>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-(--muted-soft)">Theme</p>
                  <ThemeToggle size="sm" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
