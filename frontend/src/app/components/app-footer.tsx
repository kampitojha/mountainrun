"use client";

import { ArrowUp, Check, Loader2, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { getApiUrl } from "../../lib/api";

/* ─── Social SVGs ─── */
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
  { label: "Instagram", href: "https://instagram.com/mountainrunofficial", icon: <InstagramIcon /> },
  { label: "WhatsApp", href: "https://wa.me/916006755787", icon: <WhatsAppIcon /> },
  { label: "Facebook", href: "https://facebook.com/mountainrunofficial", icon: <FacebookIcon /> },
  { label: "X", href: "https://twitter.com/mountainrun", icon: <XIcon /> },
];

/* ─── Newsletter ─── */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/subscribers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "Subscription failed");
      }
      setDone(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [email]);
  if (done) return (
    <div className="flex items-center gap-2 rounded-lg border border-(--sage)/20 bg-(--sage-soft) px-3 py-2 text-xs font-medium text-(--sage)">
      <Check className="h-3.5 w-3.5 shrink-0" /> You&rsquo;re subscribed!
    </div>
  );
  return (
    <form onSubmit={onSubmit} noValidate className="flex gap-2">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com" aria-label="Newsletter email"
        className="h-9 min-w-0 flex-1 rounded-lg border border-(--line) bg-(--panel) px-3 text-xs text-(--foreground) placeholder:text-(--muted-soft) focus:border-(--sage)/40 focus:outline-none focus:ring-2 focus:ring-(--sage)/10" />
      <button type="submit" disabled={busy} aria-label="Subscribe"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-(--sage) text-white transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-60">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      </button>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </form>
  );
}

/* ─── Footer link column ─── */
function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-soft)">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href}
              className="text-xs text-(--muted) transition-colors hover:text-(--foreground)">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Main ─── */
export function AppFooter() {
  return (
    <footer className="relative mt-auto">



      {/* Main footer */}
      <div className="bg-(--panel)">
        {/* Mountain skyline — scales perfectly, no pixelation */}
        <div aria-hidden="true" className="w-full overflow-hidden" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="xMidYMax meet"
            xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
            style={{ width: "100%", height: "auto", display: "block", maxHeight: "100px" }}>
            {/* Deep background peaks */}
            <path d="M0 100 L0 50 L60 38 L130 52 L220 28 L310 48 L410 22 L500 40 L610 12 L700 35 L800 20 L890 42 L1000 18 L1100 40 L1190 26 L1280 48 L1380 35 L1440 45 L1440 100 Z"
              fill="var(--sage)" opacity="0.06" />
            {/* Mid mountains */}
            <path d="M0 100 L0 62 L90 44 L180 58 L280 32 L380 50 L500 25 L590 42 L700 15 L790 34 L890 22 L990 42 L1080 30 L1180 48 L1280 34 L1380 52 L1440 48 L1440 100 Z"
              fill="var(--sage)" opacity="0.15" />
            {/* Foreground hills */}
            <path d="M0 100 L0 74 L120 58 L240 68 L360 50 L480 62 L600 44 L720 56 L840 42 L960 56 L1080 48 L1200 60 L1320 52 L1440 58 L1440 100 Z"
              fill="var(--sage)" opacity="0.3" />
          </svg>
        </div>

        <div className="border-t border-(--line) container-page py-8 sm:py-10">

        {/* Grid — 2 cols mobile, 4 cols tablet, 5 cols desktop */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <Link href="/" aria-label="Mountain Run home" className="group inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="Mountain Run" width={28} height={28}
                className="h-7 w-7 shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="text-base font-bold tracking-tight text-(--foreground)">
                Mountain <span className="bg-gradient-to-r from-emerald-400 via-(--sage) to-indigo-400 bg-clip-text text-transparent">Run</span>
              </span>
            </Link>
            <p className="mt-2 text-xs leading-relaxed text-(--muted) max-w-xs">
              Virtual running events with GPS-verified finishes, digital medals, and leaderboards — run anywhere across India.
            </p>
            <div className="mt-3 flex items-center gap-2">
              {socials.map(({ label, href, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-(--line) bg-(--panel-soft) text-(--muted) transition-all hover:border-(--sage)/40 hover:text-(--sage)">
                  {icon}
                </a>
              ))}
              <a href="mailto:mountainrunofficial@gmail.com" aria-label="Email"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-(--line) bg-(--panel-soft) text-(--muted) transition-all hover:border-(--sage)/40 hover:text-(--sage)">
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <FooterCol title="Events" links={[
            ["Upcoming Events", "/events"],
            ["Past Races", "/events"],
            ["Refer & Earn", "/refer"],
            ["Event Gallery", "/gallery"],
            ["Leaderboard", "/leaderboard"],
          ]} />

          <FooterCol title="About" links={[
            ["About Us", "/about"],
            ["How it Works", "/about"],
            ["Rewards & Medals", "/about"],
            ["Contact Us", "mailto:mountainrunofficial@gmail.com"],
          ]} />

          <FooterCol title="Account" links={[
            ["Sign In", "/sign-in"],
            ["Create Account", "/sign-up"],
            ["My Dashboard", "/dashboard"],
            ["My Certificates", "/dashboard"],
          ]} />

        </div>

        {/* Newsletter + Contact row */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-(--line) pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-soft)">Stay Updated</p>
              <p className="mt-1 text-xs text-(--muted)">New events, results, tips — no spam.</p>
              <div className="mt-3 max-w-xs">
                <NewsletterForm />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-soft)">Contact</p>
            <a href="mailto:mountainrunofficial@gmail.com" className="flex items-center gap-1.5 text-xs text-(--muted) transition-colors hover:text-(--foreground)">
              <Mail className="h-3 w-3 shrink-0 text-(--muted-soft)" />
              <span>mountainrunofficial@gmail.com</span>
            </a>
            <a href="https://wa.me/916006755787" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-(--muted) transition-colors hover:text-(--sage)">
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>+91 6006 755 787</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center gap-2 border-t border-(--line) pt-4 sm:flex-row sm:justify-between">
          <p className="text-[0.6rem] text-(--muted-soft)">&copy; {new Date().getFullYear()} Mountain Run. All rights reserved.</p>
          <p className="hidden text-[0.6rem] text-(--muted-soft) sm:block">Made with ♥ for Indian runners</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} type="button"
            aria-label="Scroll to top"
            className="group flex cursor-pointer items-center gap-1 text-[0.6rem] font-medium text-(--muted-soft) transition-all hover:text-(--sage)">
            Back to top <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>

      </div>
      </div>
    </footer>
  );
}
