"use client";

import { Show, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  LayoutDashboard,
  LogIn,
  Settings,
  LogOut,
  CalendarDays,
  Trophy,
  Calendar,
  Award,
} from "lucide-react";
import { BrandText } from "./brand-text";
import { ThemeToggle } from "./theme-toggle";

/* ─── Nav items with icons ─── */
const publicNav = [
  ["Events",      "/events",      Calendar],
  ["Gallery",     "/gallery",     Camera  ],
  ["Leaderboard", "/leaderboard", Trophy  ],
] as const;

/* ─── Animated hamburger ─── */
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={open}
      onClick={onClick}
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--foreground) transition-all duration-150 active:scale-90 hover:border-(--gold-line)/40 hover:bg-(--panel)"
    >
      <div className="flex h-4 w-4 flex-col justify-between">
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-all duration-150 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </div>
    </button>
  );
}

/* ─── Avatar with gradient ring ─── */
function AvatarButton({ onClick }: { onClick: () => void }) {
  const { user } = useUser();
  if (!user) return null;
  const name = user.fullName ?? user.firstName ?? "Account";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarUrl = user.imageUrl;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open profile menu"
      className="group relative cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sage)/40"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-(--line) transition-all duration-300 group-hover:ring-(--sage)/50 group-hover:scale-105 sm:h-9 sm:w-9"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 text-[0.6rem] font-bold text-white ring-2 ring-(--line) transition-all duration-300 group-hover:ring-(--sage)/50 group-hover:scale-105 sm:h-9 sm:w-9">
          {initials}
        </span>
      )}
      {/* Online indicator */}
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-(--panel) bg-emerald-500" />
    </button>
  );
}

/* ─── Profile dropdown ─── */
function ProfileDropdown() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const name = user?.fullName ?? user?.firstName ?? "Account";
  const avatarUrl = user?.imageUrl;

  return (
    <div className="relative" ref={ref}>
      <AvatarButton onClick={() => setOpen((v) => !v)} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 origin-top-right overflow-hidden rounded-2xl border border-(--line-strong) bg-(--panel) shadow-[0_20px_40px_-8px_rgba(0,0,0,0.12),0_8px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.5)]"
          >
            <div className="h-[3px] w-full bg-linear-to-r from-(--sage) via-amber-400 to-indigo-500" />
            
            {/* Athlete Header */}
            <div className="border-b border-(--line) bg-(--panel-soft)/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="truncate text-xs font-bold text-(--foreground)">{name}</p>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[0.55rem] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Athlete 🥇
                </span>
              </div>
              <p className="truncate text-[0.65rem] text-(--muted) font-mono mt-0.5">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            <div className="p-1.5 space-y-0.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-(--foreground) transition-all duration-200 hover:bg-(--sage-soft) hover:text-(--sage)"
              >
                <LayoutDashboard className="h-4 w-4 text-(--sage)" />
                My Runner Portal
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-(--foreground) transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                Trophy Cabinet &amp; Medals
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-(--foreground) transition-all duration-200 hover:bg-(--sage-soft) hover:text-(--sage)"
              >
                <Award className="h-4 w-4 text-(--sage)" />
                Official Leaderboard
              </Link>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-(--foreground) transition-all duration-200 hover:bg-(--sage-soft) hover:text-(--sage)"
              >
                <CalendarDays className="h-4 w-4 text-(--muted)" />
                Browse Open Races
              </Link>

              <div className="my-1 border-t border-(--line)" />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openUserProfile();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-(--muted) transition-all duration-200 hover:bg-(--panel-soft) hover:text-(--foreground) cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
                Account Settings
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut(() => router.push("/"));
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-(--danger) transition-all duration-200 hover:bg-(--danger)/8 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Desktop nav link ─── */
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
      href={href}
      onClick={onClick}
      className={`relative rounded-full px-4 py-1.5 text-sm font-medium tracking-tight transition-all duration-300 ${
        active
          ? "text-(--foreground)"
          : "text-(--muted-soft) hover:text-(--foreground)"
      }`}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 -z-10 rounded-full bg-(--panel) shadow-[0_1px_4px_-1px_rgba(0,0,0,0.04)]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}

/* ─── Main header ─── */
export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Strict background scroll locking for iOS and mobile browsers
  useEffect(() => {
    if (!open) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      {/* ─── Desktop floating bar ─── */}
      <div
        className={`hidden w-full max-w-[1280px] transition-all duration-500 ease-out md:block ${
          scrolled ? "-translate-y-0.5" : ""
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-2xl border border-(--line) transition-all duration-500 ease-out ${
            scrolled
              ? "bg-(--header-bg) py-2 pl-4 pr-2 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] backdrop-blur-2xl"
              : "bg-(--header-bg)/70 py-2.5 pl-5 pr-2.5 shadow-none backdrop-blur-lg"
          }`}
        >
          {/* Left — Logo */}
          <Link
            href="/"
            aria-label="Mountain Run home"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <img
              src="/logo-mark.svg"
              alt="Mountain Run"
              width={28}
              height={28}
              className={`shrink-0 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 ${
                scrolled ? "h-6 w-6 sm:h-7 sm:w-7" : "h-7 w-7 sm:h-8 sm:w-8"
              }`}
            />
            <span className={`font-bold tracking-tight text-(--foreground) transition-all duration-500 ease-out ${
              scrolled ? "text-sm sm:text-base" : "text-base sm:text-lg"
            }`}>
              <BrandText />
            </span>
          </Link>

          {/* Center — Nav pill */}
          <nav className="flex items-center gap-0.5 rounded-full border border-(--line) bg-(--panel-soft)/60 px-1 py-1 shadow-sm" aria-label="Main navigation">
            {publicNav.map(([label, href]) => (
              <NavLink
                key={href}
                active={isActive(href)}
                href={href}
                label={label}
              />
            ))}
            <Show when="signed-in">
              <NavLink
                active={isActive("/dashboard")}
                href="/dashboard"
                label="Dashboard"
              />
            </Show>
          </nav>

          {/* Right — Actions pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel-soft)/60 px-2 py-1 shadow-sm">
            <ThemeToggle size="sm" />
            <div className="h-5 w-px bg-(--line)" />
            <Show when="signed-out">
              <Link
                className="btn btn-primary h-8 px-3.5 text-xs font-semibold sm:h-9 sm:px-4 sm:text-sm"
                href="/events"
              >
                Browse events
              </Link>
            </Show>
            <Show when="signed-in">
              <ProfileDropdown />
            </Show>
          </div>
        </div>
      </div>

      {/* ─── Mobile bar ─── */}
      <div className="flex w-full items-center justify-between md:hidden">
        <div className={`flex w-full items-center justify-between rounded-2xl border border-(--line) px-4 py-2 transition-all duration-300 ${
          scrolled
            ? "bg-(--header-bg) shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] backdrop-blur-2xl"
            : "bg-(--header-bg)/80 backdrop-blur-lg"
        }`}>
          <Link href="/" aria-label="Mountain Run home" className="group flex shrink-0 items-center gap-2">
            <img
              src="/logo-mark.svg"
              alt="Mountain Run"
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-sm font-bold tracking-tight text-(--foreground)">
              <BrandText />
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <ThemeToggle size="sm" />
            <Show when="signed-in">
              <ProfileDropdown />
            </Show>
            <Hamburger open={open} onClick={() => setOpen((v) => !v)} />
          </div>
        </div>
      </div>

      {/* ─── Luxurious Full-Screen Mobile Navigation ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0b0b10] text-foreground md:hidden"
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <img
                  src="/logo-mark.svg"
                  alt="Mountain Run"
                  className="h-7 w-7 shrink-0"
                />
                <span className="text-base font-black tracking-tight text-white">
                  <BrandText />
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle size="sm" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
                  aria-label="Close navigation"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Signed-in Athlete Profile Banner */}
              <Show when="signed-in">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-indigo-600 text-xs font-black text-white ring-2 ring-white/20">
                      🏃
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">Athlete Portal</p>
                      <p className="text-[0.68rem] text-(--muted) truncate">Trophies, Bibs &amp; Results</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-xl bg-(--gold-soft) border border-(--gold-line) px-3 py-1.5 text-xs font-bold text-(--gold-deep)"
                  >
                    Dashboard →
                  </Link>
                </div>
              </Show>

              {/* Main Nav Links */}
              <div className="space-y-1">
                <p className="px-1 text-[0.65rem] font-bold uppercase tracking-widest text-(--muted-soft)">
                  Menu
                </p>

                {[
                  {
                    label: "Upcoming Races",
                    href: "/events",
                    icon: Calendar,
                    desc: "Explore virtual marathons & 5K/10K",
                    badge: "Live Race",
                  },
                  {
                    label: "National Leaderboard",
                    href: "/leaderboard",
                    icon: Trophy,
                    desc: "Live timings & runner rankings",
                  },
                  {
                    label: "Finisher Gallery",
                    href: "/gallery",
                    icon: Camera,
                    desc: "Real athlete photos & medals",
                  },
                  {
                    label: "Track Medals & Bib",
                    href: "/prize",
                    icon: Award,
                    desc: "Check certificate & delivery status",
                  },
                  {
                    label: "Policy & Help Hub",
                    href: "/policies",
                    icon: CalendarDays,
                    desc: "Shipping, refund, terms & privacy",
                  },
                ].map(({ label, href, icon: Icon, desc, badge }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between rounded-2xl p-3 transition-all ${
                        active
                          ? "bg-white/10 border border-white/15 text-white"
                          : "text-(--muted) hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                            active
                              ? "bg-(--gold) text-black font-bold shadow-md"
                              : "bg-white/5 text-(--muted) group-hover:bg-white/10 group-hover:text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{label}</span>
                            {badge && (
                              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.2 text-[0.58rem] font-extrabold uppercase tracking-wider text-emerald-400">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[0.7rem] text-(--muted-soft)">{desc}</p>
                        </div>
                      </div>

                      <svg
                        className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                          active ? "text-(--gold)" : "text-white/30"
                        }`}
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 3.5L10.5 8L6 12.5" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions & Support */}
            <div className="border-t border-white/10 bg-[#08080c] p-5 space-y-3">
              <Show when="signed-out">
                <Link
                  href="/events"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-(--gold) to-(--gold-deep) py-3.5 text-sm font-black text-black shadow-lg shadow-(--gold)/20 transition-all active:scale-98"
                >
                  <span>Explore Races &amp; Join (₹399)</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Runner Sign In</span>
                </Link>
              </Show>

              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-(--gold) to-(--gold-deep) py-3.5 text-sm font-black text-black shadow-lg shadow-(--gold)/20 transition-all active:scale-98"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Open Runner Dashboard</span>
                </Link>
              </Show>

              {/* WhatsApp Support Button */}
              <a
                href="https://wa.me/917518418960?text=Hi!%20I%20have%20a%20question%20about%20Mountain%20Run."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 py-1"
              >
                <span>💬 Need help? WhatsApp Support</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
