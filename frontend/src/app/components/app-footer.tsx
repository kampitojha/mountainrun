"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";

/* ─── Social icon SVGs ─── */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/mountainrunofficial",
    icon: <InstagramIcon />,
    hoverClass: "hover:border-pink-500 hover:text-pink-500 hover:bg-pink-50/50",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919999999999",
    icon: <WhatsAppIcon />,
    hoverClass: "hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/mountainrunofficial",
    icon: <FacebookIcon />,
    hoverClass: "hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50",
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com/mountainrun",
    icon: <XIcon />,
    hoverClass: "hover:border-(--foreground) hover:text-(--foreground) hover:bg-(--panel-soft)",
  },
];

export function AppFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-auto bg-(--panel) border-t border-(--line) shadow-xs">
      {/* Top accent line matching the header exactly */}
      <div className="h-[2px] w-full bg-linear-to-r from-(--sage) via-emerald-400 to-indigo-500" />

      <div className="container-page py-14 sm:py-16">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-5">
            <Link
              aria-label="Mountain Run home"
              className="group inline-flex items-center gap-2.5"
              href="/"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Mountain Run logo - virtual running events platform"
                className="block h-8 w-8 shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                height={32}
                src="/logo-mark.svg"
                width={32}
              />
              <span className="text-base font-semibold tracking-tight text-(--foreground) transition-colors duration-300">
                Mountain{" "}
                <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-indigo-600">
                  Run
                </span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-(--muted) max-w-xs">
              Virtual running events with GPS-verified finishes, digital
              medals, and leaderboards — run anywhere across India.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map(({ label, href, icon, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-(--line) bg-(--panel) text-(--muted) transition-all duration-300 hover:-translate-y-1 shadow-xs ${hoverClass}`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Explore */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
              Explore
            </p>
            <ul className="space-y-3 text-sm">
              {[
                ["Events", "/events"],
                ["Gallery", "/gallery"],
                ["Leaderboard", "/leaderboard"],
                ["About", "/about"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    className="group inline-flex items-center gap-1 text-(--muted) transition-all duration-200 hover:text-foreground"
                    href={href}
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Account */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
              Account
            </p>
            <ul className="space-y-3 text-sm">
              <Show when="signed-out">
                <li>
                  <Link
                    className="group inline-flex items-center gap-1 text-(--muted) transition-all duration-200 hover:text-foreground"
                    href="/sign-in"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      Sign in
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="group inline-flex items-center gap-1 text-(--muted) transition-all duration-200 hover:text-foreground"
                    href="/events"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      Join a run
                    </span>
                  </Link>
                </li>
              </Show>
              <Show when="signed-in">
                <li>
                  <Link
                    className="group inline-flex items-center gap-1 text-(--muted) transition-all duration-200 hover:text-foreground"
                    href="/dashboard"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      Dashboard
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="group inline-flex items-center gap-1 text-(--muted) transition-all duration-200 hover:text-foreground"
                    href="/register"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      Join event
                    </span>
                  </Link>
                </li>
              </Show>
            </ul>
          </div>

          {/* Col 4 — Connect */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
              Connect
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:mountainrunofficial@gmail.com"
                  className="group inline-flex items-center gap-2 text-(--muted) transition-all duration-200 hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-(--muted-soft) group-hover:text-(--sage) transition-colors" />
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    mountainrunofficial@gmail.com
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/mountainrunofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-(--muted) transition-all duration-200 hover:text-pink-500"
                >
                  <span className="text-(--muted-soft) group-hover:text-pink-500 transition-colors">@</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    mountainrunofficial
                  </span>
                </a>
              </li>
              <li className="text-(--muted-soft) text-xs leading-relaxed pt-1">
                India-wide virtual events.<br />
                Run anywhere. Finish officially.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 flex flex-col gap-4 border-t border-(--line) pt-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-(--muted-soft)">
            © {new Date().getFullYear()} Mountain Run. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-(--muted-soft) hidden sm:block">
              Made with ♥ for Indian runners
            </span>
            <button
              onClick={scrollToTop}
              type="button"
              aria-label="Scroll to top"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-(--line) bg-(--panel) text-(--muted) transition-all duration-300 hover:text-foreground hover:border-(--line-strong) hover:-translate-y-1 active:scale-95 cursor-pointer shadow-xs"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
