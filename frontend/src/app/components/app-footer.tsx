"use client";

import { Show } from "@clerk/nextjs";
import { ArrowUp, Check, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Social icon SVGs ─── */
function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ─── Social items ─── */
const socials = [
  { label: "Instagram", href: "https://instagram.com/mountainrunofficial", icon: <InstagramIcon /> },
  { label: "WhatsApp", href: "https://wa.me/916006755787", icon: <WhatsAppIcon /> },
  { label: "Facebook", href: "https://facebook.com/mountainrunofficial", icon: <FacebookIcon /> },
  { label: "X", href: "https://twitter.com/mountainrun", icon: <XIcon /> },
  { label: "Email", href: "mailto:mountainrunofficial@gmail.com", icon: <Mail className="h-4 w-4" /> },
];

/* ─── Newsletter form ─── */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }, [email]);

  if (subscribed) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-(--sage)/20 bg-(--sage-soft) px-4 py-3 text-xs text-(--sage)">
        <Check className="h-4 w-4 shrink-0" />
        <span className="font-medium">You&rsquo;re subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          aria-label="Email for newsletter"
          className="h-10 w-full rounded-xl border border-(--line) bg-(--panel) px-3.5 pr-9 text-sm text-(--foreground) placeholder:text-(--muted-soft) transition-all duration-200 focus:border-(--sage)/40 focus:outline-none focus:ring-[3px] focus:ring-(--sage)/10"
        />
        <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-soft)" />
      </div>
      <button
        type="submit"
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-(--sage) text-white transition-all duration-200 hover:bg-emerald-600 hover:shadow-lg active:scale-95"
        aria-label="Subscribe"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

/* ─── Back to top ─── */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      type="button"
      aria-label="Scroll to top"
      className={`group fixed bottom-6 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-(--line-strong) bg-(--panel) text-(--muted) shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-(--sage)/40 hover:bg-(--sage-soft) hover:text-(--sage) hover:shadow-[0_8px_24px_-4px_rgba(13,148,136,0.2)] active:scale-90 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}

/* ─── Mountain silhouette ─── */
function MountainSilhouette() {
  return (
    <div className="relative w-full overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        className="w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px]"
        preserveAspectRatio="none"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 70 L80 45 L130 55 L180 30 L240 50 L290 20 L350 40 L400 60 L450 35 L510 15 L560 45 L620 25 L680 55 L740 35 L800 50 L860 10 L920 40 L970 55 L1020 25 L1080 45 L1130 30 L1190 50 L1250 20 L1310 40 L1360 55 L1440 35 V120 H0 Z"
          className="text-(--sage) opacity-[0.04] dark:opacity-[0.06]"
        />
        <path
          d="M0 80 L100 55 L160 65 L220 40 L280 60 L340 30 L400 50 L460 70 L520 45 L580 25 L640 55 L700 35 L760 60 L820 45 L880 65 L940 20 L1000 50 L1060 65 L1120 35 L1180 55 L1240 40 L1300 60 L1360 45 L1440 55 V120 H0 Z"
          className="text-(--sage) opacity-[0.025] dark:opacity-[0.04]"
        />
      </svg>
    </div>
  );
}

/* ─── Main export ─── */
export function AppFooter() {
  return (
    <>
      <BackToTop />

      <footer className="relative mt-auto bg-[var(--background)]">
        {/* Mountain silhouette */}
        <MountainSilhouette />

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-(--sage)/40 to-transparent" />

        {/* ─── CTA Section ─── */}
        <div className="container-page py-10 sm:py-14 md:py-18">
          <div className="relative overflow-hidden rounded-3xl border border-(--line) bg-gradient-to-br from-(--panel) via-(--panel) to-(--sage-soft) px-6 py-10 shadow-[0_8px_40px_-8px_rgba(13,148,136,0.06)] sm:px-10 sm:py-14 md:px-14 md:py-16">
            {/* Decorative blobs */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-(--sage) opacity-[0.03] blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-500 opacity-[0.03] blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl md:text-5xl">
                Ready for your next challenge?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-(--muted) sm:text-base md:text-lg">
                Join thousands of runners completing verified virtual races across India.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link className="btn btn-primary min-w-[11rem] text-sm sm:text-base" href="/events">
                  Browse Events
                </Link>
                <Show when="signed-out">
                  <Link className="btn btn-secondary min-w-[11rem] text-sm sm:text-base" href="/sign-up">
                    Create Account
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link className="btn btn-secondary min-w-[11rem] text-sm sm:text-base" href="/dashboard">
                    My Dashboard
                  </Link>
                </Show>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Footer ─── */}
        <div className="border-t border-(--line) bg-(--panel)">
          <div className="container-page py-10 sm:py-14 md:py-16">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">

              {/* Col 1: Brand */}
              <div className="sm:col-span-2 lg:col-span-1">
                <Link href="/" aria-label="Mountain Run home" className="group inline-flex items-center gap-2.5">
                  <img
                    src="/logo-mark.svg"
                    alt="Mountain Run"
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 sm:h-8 sm:w-8"
                  />
                  <span className="text-base font-bold tracking-tight text-(--foreground) sm:text-lg">
                    Mountain{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-(--sage) to-indigo-500 bg-clip-text font-extrabold text-transparent">
                      Run
                    </span>
                  </span>
                </Link>
                <p className="mt-4 text-sm leading-relaxed text-(--muted) max-w-xs">
                  Verified virtual running events built for runners who love challenges, consistency and achievement.
                </p>
                <ul className="mt-5 space-y-2">
                  {["GPS Verified", "Digital Certificates", "Nationwide Events"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-(--muted)">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--sage-soft) text-(--sage)">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 2: Explore */}
              <div>
                <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Explore</h3>
                <ul className="mt-4 space-y-2.5">
                  {[["Events", "/events"], ["Leaderboard", "/leaderboard"], ["Gallery", "/gallery"], ["About", "/about"], ["FAQ", "/faq"]].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="group inline-flex items-center gap-2 text-sm text-(--muted) transition-all duration-200 hover:text-(--foreground)">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-(--sage) opacity-0 transition-all duration-200 group-hover:opacity-100" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Resources */}
              <div>
                <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Resources</h3>
                <ul className="mt-4 space-y-2.5">
                  {[["How it Works", "/how-it-works"], ["Rules", "/rules"], ["Privacy Policy", "/privacy"], ["Terms", "/terms"], ["Contact", "/contact"]].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="group inline-flex items-center gap-2 text-sm text-(--muted) transition-all duration-200 hover:text-(--foreground)">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-(--sage) opacity-0 transition-all duration-200 group-hover:opacity-100" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Community */}
              <div>
                <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Community</h3>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {socials.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="group flex h-10 w-10 items-center justify-center rounded-full border border-(--line-strong) bg-(--panel-soft) text-(--muted) transition-all duration-300 hover:scale-110 hover:border-transparent hover:bg-gradient-to-br hover:from-(--sage) hover:to-emerald-500 hover:text-white hover:shadow-[0_4px_16px_-2px_rgba(13,148,136,0.3)] active:scale-95"
                    >
                      <span className="transition-transform duration-300 group-hover:rotate-[8deg]">
                        {icon}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Col 5: Newsletter */}
              <div>
                <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted)">Newsletter</h3>
                <p className="mt-3 text-sm font-semibold text-(--foreground)">Stay Updated</p>
                <p className="mt-1 text-xs leading-relaxed text-(--muted)">Receive event launches and exclusive challenges.</p>
                <div className="mt-4">
                  <NewsletterForm />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="border-t border-(--line) bg-(--background)">
          <div className="container-page py-5 sm:py-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              {/* Left */}
              <p className="text-center text-xs text-(--muted-soft) sm:text-left">
                &copy; {new Date().getFullYear()} Mountain Run. Made for runners across India.
              </p>

              {/* Center badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                {["GPS Verified", "India Wide", "Secure Payments"].map((badge) => (
                  <span key={badge} className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-(--muted-soft)">
                    <span className="h-1 w-1 rounded-full bg-(--sage)" />
                    {badge}
                  </span>
                ))}
              </div>

              {/* Right */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                type="button"
                aria-label="Scroll to top"
                className="group inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-(--muted-soft) transition-all duration-200 hover:text-(--sage)"
              >
                Back to top
                <ArrowUp className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
