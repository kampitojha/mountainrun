"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Image as ImageIcon, Info, Trophy, LayoutDashboard, Award, LogIn } from "lucide-react";

/** Public nav — Register is not duplicated here. */
const publicNav = [
  ["Events", "/events", Calendar],
  ["Gallery", "/gallery", ImageIcon],
  ["About", "/about", Info],
  ["Leaderboard", "/leaderboard", Trophy],
] as const;

function ProfileButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-9 w-9 border border-(--line) hover:border-slate-300 transition-colors",
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link label="My dashboard" href="/dashboard" labelIcon={<LayoutDashboard className="h-4 w-4" />} />
        <UserButton.Link label="Register for event" href="/register" labelIcon={<Award className="h-4 w-4" />} />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
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
      className={`relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ${
        active ? "text-slate-900" : "text-(--muted) hover:text-slate-900"
      }`}
      href={href}
      onClick={onClick}
    >
      {active && (
        <motion.span
          layoutId="active-nav-pill"
          className="absolute inset-0 bg-white border border-(--line) rounded-full shadow-xs -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
      <span>{label}</span>
    </Link>
  );
}

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
        alt=""
        className="block h-8 w-8 shrink-0 sm:h-9 sm:w-9 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-12"
        height={36}
        src="/logo-mark.svg"
        width={36}
      />
      <span className="text-base font-semibold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-slate-900 sm:text-lg">
        Mountain{" "}
        <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-indigo-600">
          Run
        </span>
      </span>
    </Link>
  );
}

/* ─── Animated Premium Hamburger Icon ─── */
function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      className="focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--line) bg-white text-foreground hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={onClick}
      type="button"
    >
      <div className="relative flex h-5 w-5 flex-col items-center justify-center">
        <motion.span
          className="absolute h-[1.5px] w-4 bg-current"
          animate={{
            y: open ? 0 : -5,
            rotate: open ? 45 : 0,
            width: open ? "16px" : "16px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        />
        <motion.span
          className="absolute h-[1.5px] w-4 bg-current"
          animate={{
            opacity: open ? 0 : 1,
            scale: open ? 0.6 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
        <motion.span
          className="absolute h-[1.5px] w-4 bg-current"
          animate={{
            y: open ? 0 : 5,
            rotate: open ? -45 : 0,
            width: open ? "16px" : "16px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        />
      </div>
    </button>
  );
}

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-(--line) bg-white/80 backdrop-blur-xl shadow-xs">
      {/* Accent color gradient bar */}
      <div className="h-[2px] w-full bg-linear-to-r from-(--sage) via-emerald-400 to-indigo-500" />
      
      <div className="container-page">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          <BrandLogo onNavigate={() => setOpen(false)} />

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-0.5 md:flex">
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
                <Link className="btn btn-ghost h-9 px-3" href="/sign-in">
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

            {/* Mobile Actions: Profile Avatar + Animated Hamburger */}
            <div className="flex items-center gap-1.5 md:hidden">
              <Show when="signed-in">
                <ProfileButton />
              </Show>
              <HamburgerButton open={open} onClick={() => setOpen((prev) => !prev)} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay Container */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop: floats over content beneath header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-x-0 bottom-0 top-[56px] sm:top-[64px] z-30 bg-slate-900/20 backdrop-blur-xs md:hidden"
            />

            {/* Floating Drawer Overlay */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="absolute left-0 right-0 top-full z-40 border-b border-(--line) bg-white px-4 pb-6 pt-2 shadow-lg md:hidden overflow-hidden"
            >
              <nav className="flex flex-col gap-1.5">
                {publicNav.map(([label, href, Icon]) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                        active
                          ? "bg-(--sage-soft) text-(--sage)"
                          : "text-(--muted) hover:bg-(--panel-soft) hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-(--sage)" : "text-(--muted-soft)"}`} />
                      <span>{label}</span>
                    </Link>
                  );
                })}

                <Show when="signed-in">
                  <div className="my-2 border-t border-(--line)" />
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive("/dashboard")
                        ? "bg-(--sage-soft) text-(--sage)"
                        : "text-(--muted) hover:bg-(--panel-soft) hover:text-foreground"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-(--muted-soft)" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-(--muted) hover:bg-(--panel-soft) hover:text-foreground transition"
                  >
                    <Award className="h-4 w-4 text-(--muted-soft)" />
                    <span>Join event</span>
                  </Link>
                </Show>

                <Show when="signed-out">
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-(--line) pt-4">
                    <Link
                      className="btn btn-secondary h-10 w-full text-xs font-bold"
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn className="mr-1.5 h-3.5 w-3.5" />
                      Sign in
                    </Link>
                    <Link
                      className="btn btn-primary h-10 w-full text-xs font-bold"
                      href="/events"
                      onClick={() => setOpen(false)}
                    >
                      Join a run
                    </Link>
                  </div>
                </Show>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
