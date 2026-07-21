"use client";

import { Show, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LogIn,
  Settings,
  LogOut,
  CalendarDays,
  ImageIcon,
  Trophy,
  Info,
  Calendar,
  Gift,
} from "lucide-react";
import { BrandText } from "./brand-text";
import { ThemeToggle } from "./theme-toggle";

/* ─── Nav items with icons ─── */
const publicNav = [
  ["Events",      "/events",      Calendar     ],
  ["Refer & Earn","/refer",       Gift         ],
  ["Gallery",     "/gallery",     ImageIcon    ],
  ["Leaderboard", "/leaderboard", Trophy       ],
  ["About",       "/about",       Info         ],
] as const;

const navEmojis: Record<string, string> = {
  "/events":      "🏃",
  "/refer":       "🎁",
  "/gallery":     "📸",
  "/leaderboard": "👑",
  "/about":       "📖",
};

/* ─── Animated hamburger ─── */
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--foreground) transition-all duration-200 hover:border-(--sage)/30 hover:bg-(--sage-soft) active:scale-90"
    >
      <span className="flex w-5 flex-col gap-[5px]">
        <motion.span
          animate={open ? { rotate: 45, y: 6.5, width: 20 } : { rotate: 0, y: 0, width: 20 }}
          className="block h-[1.5px] origin-center rounded-full bg-current"
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          className="block h-[1.5px] origin-center rounded-full bg-current"
          transition={{ duration: 0.2 }}
        />
        <motion.span
          animate={open ? { rotate: -45, y: -6.5, width: 20 } : { rotate: 0, y: 0, width: 20 }}
          className="block h-[1.5px] origin-center rounded-full bg-current"
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
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
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
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
            <div className="h-[3px] w-full bg-gradient-to-r from-(--sage) via-emerald-400 to-indigo-500" />
            <div className="flex justify-center pt-4 pb-2">
              <img
                alt="Mountain Run"
                className="h-8 w-8 opacity-70"
                height={32}
                src="/logo-mark.svg"
                width={32}
              />
            </div>
            <div className="px-2 pb-2">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--foreground) transition-all duration-200 hover:bg-(--sage-soft) hover:text-(--sage)"
              >
                <LayoutDashboard className="h-4 w-4 text-(--muted)" />
                My dashboard
              </Link>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--foreground) transition-all duration-200 hover:bg-(--sage-soft) hover:text-(--sage)"
              >
                <CalendarDays className="h-4 w-4 text-(--muted)" />
                Browse events
              </Link>
              <button
                type="button"
                onClick={() => { setOpen(false); openUserProfile(); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--foreground) transition-all duration-200 hover:bg-(--sage-soft) hover:text-(--sage)"
              >
                <Settings className="h-4 w-4 text-(--muted)" />
                Manage account
              </button>
              <div className="my-1.5 mx-2 h-px bg-gradient-to-r from-transparent via-(--line) to-transparent" />
              <button
                type="button"
                onClick={() => { setOpen(false); void signOut(() => router.push("/")); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-(--danger) transition-all duration-200 hover:bg-(--danger)/8"
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
  const isRefer = href === "/refer";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative rounded-full px-4 py-1.5 text-sm font-medium tracking-tight transition-all duration-300 ${
        isRefer
          ? "text-white"
          : active
            ? "text-(--foreground)"
            : "text-(--muted-soft) hover:text-(--foreground)"
      }`}
    >
      {label}
      {active && !isRefer && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 -z-10 rounded-full bg-(--panel) shadow-[0_1px_4px_-1px_rgba(0,0,0,0.04)]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      {isRefer && (
        <span className={`absolute inset-0 -z-10 rounded-full transition-all duration-300 ${
          active
            ? "bg-gradient-to-r from-(--sage) to-emerald-500 shadow-[0_0_16px_-3px_var(--sage)]"
            : "bg-gradient-to-r from-(--sage) to-emerald-500 shadow-[0_0_12px_-4px_var(--sage)]"
        }`} />
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
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
        <div className={`flex w-full items-center justify-between rounded-2xl border border-(--line) px-4 py-2 transition-all duration-500 ${
          scrolled
            ? "bg-(--header-bg) shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] backdrop-blur-2xl"
            : "bg-(--header-bg)/70 backdrop-blur-lg"
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

      {/* ─── Mobile overlay menu ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-center justify-center md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-(--overlay) backdrop-blur-md"
              onClick={() => setOpen(false)}
            />

            {/* Centered menu */}
            <motion.nav
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex w-[85vw] max-w-sm flex-col gap-1.5 rounded-3xl border border-(--line-strong) bg-(--panel) p-3 shadow-2xl"
            >
              {publicNav.map(([label, href], i) => {
                const active = isActive(href);
                const isRefer = href === "/refer";
                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        active
                          ? isRefer
                            ? "bg-gradient-to-r from-(--sage) to-emerald-500 text-white shadow-md"
                            : "bg-(--sage-soft) text-(--sage)"
                          : isRefer
                            ? "bg-gradient-to-r from-(--sage)/10 to-emerald-500/10 text-(--sage) ring-1 ring-inset ring-(--sage)/20"
                            : "text-(--muted) hover:bg-(--sage-soft)/40 hover:text-(--foreground)"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg leading-none">
                        {navEmojis[href]}
                      </span>
                      <span className="flex-1">{label}</span>
                      <svg className={`h-4 w-4 transition-all group-hover:translate-x-0.5 ${active ? (isRefer ? "text-white" : "text-(--sage)") : isRefer ? "text-(--sage)" : "text-(--muted-soft)"}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 4 4 4-4 4" />
                      </svg>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Dashboard */}
              <Show when="signed-in">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: publicNav.length * 0.05, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mx-3 my-1.5 h-px bg-gradient-to-r from-(--line) via-(--line) to-transparent" />
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive("/dashboard")
                        ? "bg-(--sage-soft) text-(--sage)"
                        : "text-(--muted) hover:bg-(--sage-soft)/40 hover:text-(--foreground)"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
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

              {/* Sign in for signed-out */}
              <Show when="signed-out">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: publicNav.length * 0.05, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mx-3 my-1.5 h-px bg-gradient-to-r from-(--line) via-(--line) to-transparent" />
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-(--muted) transition-all duration-200 hover:bg-(--sage-soft)/40 hover:text-(--foreground)"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--panel-soft) text-(--muted-soft) group-hover:bg-(--line)">
                      <LogIn className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="flex-1">Sign in</span>
                    <svg className="h-4 w-4 text-(--muted-soft) transition-all group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 4 4 4-4 4" />
                    </svg>
                  </Link>
                </motion.div>
              </Show>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
