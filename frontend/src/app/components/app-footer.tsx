"use client";

import { Show } from "@clerk/nextjs";
import { ArrowUp, Check, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true); setEmail("");
  }, [email]);
  if (done) return (
    <div className="flex items-center gap-2 rounded-xl border border-(--sage)/20 bg-(--sage-soft) px-3.5 py-2.5 text-xs font-medium text-(--sage)">
      <Check className="h-3.5 w-3.5 shrink-0" /> You&rsquo;re subscribed!
    </div>
  );
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com" required aria-label="Newsletter email"
        className="h-10 min-w-0 flex-1 rounded-xl border border-(--line) bg-(--panel) px-3 text-sm text-(--foreground) placeholder:text-(--muted-soft) focus:border-(--sage)/40 focus:outline-none focus:ring-2 focus:ring-(--sage)/10" />
      <button type="submit" aria-label="Subscribe"
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-(--sage) text-white transition-all hover:bg-emerald-600 active:scale-95">
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

/* ─── City sketch SVG (hand-drawn line art style) ─── */
function CitySketch() {
  return (
    <div className="w-full overflow-hidden bg-(--background)" aria-hidden="true" style={{ lineHeight: 0 }}>
      <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
        preserveAspectRatio="xMidYMax meet"
        style={{ width: "100%", height: "clamp(55px,7vw,100px)", display: "block", opacity: 0.13, color: "var(--foreground)" }}>
        {/* Ground */}
        <line x1="0" y1="95" x2="1440" y2="95" strokeWidth="1.5"/>
        {/* B1 */}
        <rect x="20" y="55" width="44" height="40" strokeWidth="1.5"/>
        <rect x="28" y="63" width="9" height="12" strokeWidth="1"/><rect x="44" y="63" width="9" height="12" strokeWidth="1"/>
        <rect x="28" y="80" width="9" height="12" strokeWidth="1"/><rect x="44" y="80" width="9" height="12" strokeWidth="1"/>
        <rect x="33" y="40" width="12" height="15" strokeWidth="1.5"/>
        <polygon points="39,28 26,40 52,40" strokeWidth="1.5"/><line x1="39" y1="18" x2="39" y2="28" strokeWidth="1.5"/>
        {/* B2 */}
        <rect x="78" y="60" width="38" height="35" strokeWidth="1.5"/>
        <rect x="85" y="68" width="8" height="10" strokeWidth="1"/><rect x="99" y="68" width="8" height="10" strokeWidth="1"/>
        <rect x="85" y="83" width="8" height="10" strokeWidth="1"/><rect x="99" y="83" width="8" height="10" strokeWidth="1"/>
        {/* B3 tall */}
        <rect x="130" y="30" width="32" height="65" strokeWidth="1.5"/>
        <line x1="146" y1="14" x2="146" y2="30" strokeWidth="1.5"/>
        <rect x="137" y="38" width="7" height="9" strokeWidth="1"/><rect x="149" y="38" width="7" height="9" strokeWidth="1"/>
        <rect x="137" y="52" width="7" height="9" strokeWidth="1"/><rect x="149" y="52" width="7" height="9" strokeWidth="1"/>
        <rect x="137" y="66" width="7" height="9" strokeWidth="1"/><rect x="149" y="66" width="7" height="9" strokeWidth="1"/>
        <rect x="137" y="80" width="7" height="9" strokeWidth="1"/><rect x="149" y="80" width="7" height="9" strokeWidth="1"/>
        {/* B4 arch */}
        <rect x="176" y="48" width="40" height="47" strokeWidth="1.5"/>
        <path d="M176 48 Q196 30 216 48" strokeWidth="1.5"/>
        <rect x="183" y="56" width="8" height="11" strokeWidth="1"/><rect x="197" y="56" width="8" height="11" strokeWidth="1"/>
        <rect x="183" y="73" width="8" height="11" strokeWidth="1"/><rect x="197" y="73" width="8" height="11" strokeWidth="1"/>
        {/* B5 */}
        <rect x="230" y="62" width="28" height="33" strokeWidth="1.5"/>
        <rect x="236" y="70" width="6" height="8" strokeWidth="1"/><rect x="246" y="70" width="6" height="8" strokeWidth="1"/>
        <rect x="236" y="83" width="6" height="8" strokeWidth="1"/><rect x="246" y="83" width="6" height="8" strokeWidth="1"/>
        <rect x="237" y="48" width="14" height="14" strokeWidth="1.5"/>
        {/* B6 step */}
        <rect x="272" y="42" width="48" height="53" strokeWidth="1.5"/>
        <rect x="280" y="28" width="32" height="14" strokeWidth="1.5"/>
        <rect x="288" y="16" width="16" height="12" strokeWidth="1.5"/>
        <rect x="280" y="50" width="8" height="10" strokeWidth="1"/><rect x="294" y="50" width="8" height="10" strokeWidth="1"/><rect x="308" y="50" width="8" height="10" strokeWidth="1"/>
        <rect x="280" y="65" width="8" height="10" strokeWidth="1"/><rect x="294" y="65" width="8" height="10" strokeWidth="1"/><rect x="308" y="65" width="8" height="10" strokeWidth="1"/>
        <rect x="280" y="80" width="8" height="10" strokeWidth="1"/><rect x="308" y="80" width="8" height="10" strokeWidth="1"/>
        {/* B7 */}
        <rect x="334" y="55" width="36" height="40" strokeWidth="1.5"/>
        <path d="M334 55 L352 38 L370 55" strokeWidth="1.5"/>
        <rect x="341" y="63" width="8" height="10" strokeWidth="1"/><rect x="354" y="63" width="8" height="10" strokeWidth="1"/>
        <rect x="341" y="78" width="8" height="10" strokeWidth="1"/><rect x="354" y="78" width="8" height="10" strokeWidth="1"/>
        {/* B8 */}
        <rect x="384" y="35" width="30" height="60" strokeWidth="1.5"/>
        <line x1="399" y1="20" x2="399" y2="35" strokeWidth="1.5"/>
        <rect x="390" y="43" width="6" height="8" strokeWidth="1"/><rect x="402" y="43" width="6" height="8" strokeWidth="1"/>
        <rect x="390" y="56" width="6" height="8" strokeWidth="1"/><rect x="402" y="56" width="6" height="8" strokeWidth="1"/>
        <rect x="390" y="69" width="6" height="8" strokeWidth="1"/><rect x="402" y="69" width="6" height="8" strokeWidth="1"/>
        <rect x="390" y="82" width="6" height="8" strokeWidth="1"/><rect x="402" y="82" width="6" height="8" strokeWidth="1"/>
        {/* B9 */}
        <rect x="428" y="58" width="34" height="37" strokeWidth="1.5"/>
        <rect x="435" y="66" width="7" height="9" strokeWidth="1"/><rect x="447" y="66" width="7" height="9" strokeWidth="1"/>
        <rect x="435" y="80" width="7" height="9" strokeWidth="1"/><rect x="447" y="80" width="7" height="9" strokeWidth="1"/>
        {/* B10 */}
        <rect x="476" y="45" width="40" height="50" strokeWidth="1.5"/>
        <path d="M476 45 Q496 27 516 45" strokeWidth="1.5"/>
        <rect x="483" y="53" width="8" height="10" strokeWidth="1"/><rect x="497" y="53" width="8" height="10" strokeWidth="1"/>
        <rect x="483" y="68" width="8" height="10" strokeWidth="1"/><rect x="497" y="68" width="8" height="10" strokeWidth="1"/>
        <rect x="483" y="83" width="8" height="10" strokeWidth="1"/><rect x="497" y="83" width="8" height="10" strokeWidth="1"/>
      </svg>
    </div>
  );
}

/* ─── Footer link column ─── */
function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-(--foreground)">{title}</p>
      <ul className="mt-3.5 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href}
              className="text-sm text-(--muted) transition-colors hover:text-(--foreground)">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const popularEvents = [
  "Monsoon Mountain Miles", "Himalayan Winter Sprint",
  "Independence Endurance Run", "Spring Valley Dash",
  "Holi Color Virtual Run", "New Year Night Miles",
];

/* ─── Main ─── */
export function AppFooter() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <footer className="relative mt-auto">
      {/* City sketch illustration */}
      <CitySketch />

      {/* Accent bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-(--sage) via-emerald-400 to-indigo-500" />

      {/* CTA — signed-out only */}
      <Show when="signed-out">
        <div className="bg-(--panel-soft)/60 border-b border-(--line)">
          <div className="container-page py-10 sm:py-12">
            <div className="relative overflow-hidden rounded-2xl border border-(--line) bg-(--panel) px-6 py-10 sm:px-10 sm:py-12">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-(--sage) opacity-[0.04] blur-3xl" />
              <div className="relative mx-auto max-w-2xl text-center">
                <p className="eyebrow">Join Mountain Run</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">Ready for your next challenge?</h2>
                <p className="lede mx-auto mt-3 max-w-md">Join thousands of runners completing verified virtual races across India.</p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link className="btn btn-primary" href="/events">Browse Events</Link>
                  <Link className="btn btn-secondary" href="/sign-up">Create Free Account</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Main footer */}
      <div className="bg-(--panel) border-t border-(--line)">
        <div className="container-page pt-10 pb-6 sm:pt-12 sm:pb-8">

          {/* Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">

            {/* Brand — spans 2 cols on mobile/sm, 2 on lg */}
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" aria-label="Mountain Run home" className="group inline-flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.svg" alt="Mountain Run" width={32} height={32}
                  className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span className="text-lg font-bold tracking-tight text-(--foreground)">
                  Mountain <span className="bg-gradient-to-r from-emerald-400 via-(--sage) to-indigo-400 bg-clip-text text-transparent">Run</span>
                </span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-(--muted) max-w-xs">
                Virtual running events with GPS-verified finishes, digital medals, and leaderboards — run anywhere across India.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["GPS Verified", "Pan-India", "Secure UPI"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel-soft) px-2.5 py-1 text-[0.65rem] font-semibold text-(--muted)">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--sage)" />{t}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ label, href, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-(--line) bg-(--panel-soft) text-(--muted) transition-all duration-200 hover:border-(--sage)/50 hover:bg-(--sage-soft) hover:text-(--sage)">
                    {icon}
                  </a>
                ))}
                <a href="mailto:mountainrunofficial@gmail.com" aria-label="Email"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-(--line) bg-(--panel-soft) text-(--muted) transition-all duration-200 hover:border-(--sage)/50 hover:bg-(--sage-soft) hover:text-(--sage)">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            <FooterCol title="Events" links={[
              ["Upcoming Events", "/events"],
              ["Past Races", "/events"],
              ["Event Gallery", "/gallery"],
              ["Leaderboard", "/leaderboard"],
              ["Register Now", "/events"],
            ]} />

            <FooterCol title="About" links={[
              ["About Us", "/about"],
              ["How it Works", "/about"],
              ["Rewards & Medals", "/about"],
              ["FAQ", "/about"],
              ["Contact Us", "mailto:mountainrunofficial@gmail.com"],
            ]} />

            <FooterCol title="Account" links={[
              ["Sign In", "/sign-in"],
              ["Create Account", "/sign-up"],
              ["My Dashboard", "/dashboard"],
              ["Upload GPS Proof", "/dashboard"],
              ["My Certificates", "/dashboard"],
            ]} />

            {/* Newsletter + Contact */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-(--foreground)">Stay Updated</p>
              <p className="mt-3 text-sm font-semibold text-(--foreground)">Get event launches</p>
              <p className="mt-1 text-xs leading-relaxed text-(--muted)">New events, results, tips — no spam.</p>
              <div className="mt-3.5">
                <NewsletterForm />
              </div>
              {/* Contact — properly stacked */}
              <div className="mt-5 space-y-2.5">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-(--foreground)">Contact</p>
                <a href="mailto:mountainrunofficial@gmail.com"
                  className="flex items-start gap-2 text-xs text-(--muted) transition-colors hover:text-(--foreground)">
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--muted-soft)" />
                  <span>mountainrunofficial@gmail.com</span>
                </a>
                <a href="https://wa.me/916006755787" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-(--muted) transition-colors hover:text-(--sage)">
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </span>
                  <span>+91 6006 755 787</span>
                </a>
              </div>
            </div>

          </div>

          {/* Popular Events */}
          <div className="mt-8 border-t border-(--line) pt-6">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted-soft)">Popular Events</p>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
              {popularEvents.map((ev) => (
                <Link key={ev} href="/events"
                  className="text-xs text-(--muted) transition-colors hover:text-(--sage) hover:underline underline-offset-2">
                  {ev}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-(--line) pt-5 sm:flex-row sm:justify-between">
            <p className="text-xs text-(--muted-soft)">&copy; {new Date().getFullYear()} Mountain Run. All rights reserved.</p>
            <p className="hidden text-xs text-(--muted-soft) sm:block">Made with ♥ for Indian runners &middot; India-wide virtual events</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} type="button"
              aria-label="Scroll to top"
              className="group flex cursor-pointer items-center gap-1.5 text-xs font-medium text-(--muted-soft) transition-all hover:text-(--sage)">
              Back to top <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
