"use client";

import { Show } from "@clerk/nextjs";
import { ArrowUp, Mail, MapPin } from "lucide-react";
import Link from "next/link";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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

const socials = [
  { label: "Instagram", href: "https://instagram.com/mountainrunofficial", icon: <InstagramIcon />, hoverColor: "hover:text-pink-500 hover:border-pink-500/40 hover:bg-pink-500/10" },
  { label: "WhatsApp", href: "https://wa.me/916006755787", icon: <WhatsAppIcon />, hoverColor: "hover:text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/10" },
  { label: "Facebook", href: "https://facebook.com/mountainrunofficial", icon: <FacebookIcon />, hoverColor: "hover:text-blue-600 hover:border-blue-600/40 hover:bg-blue-600/10" },
  { label: "X", href: "https://twitter.com/mountainrun", icon: <XIcon />, hoverColor: "hover:text-(--foreground) hover:border-(--line-strong) hover:bg-(--panel-soft)" },
];

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-(--line) bg-(--panel)">
      <div className="h-1 w-full bg-gradient-to-r from-(--sage) via-emerald-400 to-indigo-500" />

      <div className="container-page py-8 sm:py-10 md:py-12">

        {/* Logo + tagline */}
        <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Link href="/" aria-label="Mountain Run home" className="inline-flex items-center justify-center gap-2.5 group sm:justify-start">
            <img
              src="/logo-mark.svg"
              alt="Mountain Run"
              width={28} height={28}
              className="h-7 w-7 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
            />
            <span className="text-base font-bold tracking-tight text-(--foreground)">
              Mountain{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">
                Run
              </span>
            </span>
          </Link>
          <p className="text-xs text-(--muted-soft)">
            Virtual running events &middot; GPS verified &middot; India-wide
          </p>
        </div>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-(--line) to-transparent" />

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">

          {/* Explore */}
          <div>
            <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Explore</p>
            <ul className="space-y-2">
              {[["Events", "/events"], ["Gallery", "/gallery"], ["Leaderboard", "/leaderboard"], ["About", "/about"]].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="inline-block text-sm text-(--muted) transition-all duration-200 hover:translate-x-0.5 hover:text-(--sage)">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Account</p>
            <ul className="space-y-2 text-sm">
              <Show when="signed-out">
                <li><Link href="/sign-in" className="inline-block text-(--muted) transition-all duration-200 hover:translate-x-0.5 hover:text-(--sage)">Sign in</Link></li>
                <li><Link href="/events" className="inline-block text-(--muted) transition-all duration-200 hover:translate-x-0.5 hover:text-(--sage)">Browse events</Link></li>
              </Show>
              <Show when="signed-in">
                <li><Link href="/dashboard" className="inline-block text-(--muted) transition-all duration-200 hover:translate-x-0.5 hover:text-(--sage)">Dashboard</Link></li>
                <li><Link href="/events" className="inline-block text-(--muted) transition-all duration-200 hover:translate-x-0.5 hover:text-(--sage)">Browse events</Link></li>
              </Show>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Support</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:mountainrunofficial@gmail.com" className="group flex items-center gap-2 text-(--muted) transition-all duration-200 hover:translate-x-0.5 hover:text-(--sage)">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-(--muted-soft) transition-colors group-hover:text-(--sage)" />
                  <span className="truncate text-xs sm:text-sm">mountainrunofficial@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="https://instagram.com/mountainrunofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-(--muted) transition-all duration-200 hover:translate-x-0.5 hover:text-pink-500">
                  <InstagramIcon />
                  <span className="text-xs sm:text-sm">@mountainrunofficial</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-(--muted-soft)">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs sm:text-sm">India</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Connect</p>
            <div className="flex flex-wrap gap-2">
              {socials.map(({ label, href, icon, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border border-(--line) bg-(--panel-soft) text-(--muted) transition-all duration-200 hover:scale-110 hover:shadow-lg ${hoverColor}`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-(--line) pt-5 sm:flex-row sm:justify-between">
          <p className="order-2 text-center text-xs text-(--muted-soft) sm:order-1">
            &copy; {new Date().getFullYear()} Mountain Run. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            type="button"
            aria-label="Scroll to top"
            className="group order-1 flex cursor-pointer items-center gap-1.5 text-xs text-(--muted-soft) transition-colors hover:text-(--foreground) sm:order-2"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
