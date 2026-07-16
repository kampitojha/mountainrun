"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--panel)]">
      <div className="container-page py-10 sm:py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              aria-label="Mountain Run home"
              className="inline-flex items-center gap-2.5"
              href="/"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="block h-8 w-8 shrink-0 sm:h-9 sm:w-9"
                height={36}
                src="/logo-mark.svg"
                width={36}
              />
              <span className="text-sm font-semibold tracking-tight text-[var(--foreground)] sm:text-base">
                Mountain Run
              </span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Virtual races with verified finishes, clean leaderboards, medals, and
              simple post-run proof upload across India.
            </p>
            <a
              className="mt-4 inline-flex text-sm font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
              href="mailto:hello@mountainrun.in"
            >
              hello@mountainrun.in
            </a>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-soft)]">
              Explore
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-[var(--muted)]">
              <li>
                <Link className="transition hover:text-[var(--foreground)]" href="/events">
                  Events
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-[var(--foreground)]" href="/gallery">
                  Gallery
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-[var(--foreground)]" href="/about">
                  About
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-[var(--foreground)]" href="/leaderboard">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-soft)]">
              Account
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-[var(--muted)]">
              <Show when="signed-out">
                <li>
                  <Link className="transition hover:text-[var(--foreground)]" href="/sign-in">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-[var(--foreground)]" href="/register">
                    Register
                  </Link>
                </li>
              </Show>
              <Show when="signed-in">
                <li>
                  <Link className="transition hover:text-[var(--foreground)]" href="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-[var(--foreground)]" href="/register">
                    Join event
                  </Link>
                </li>
              </Show>
            </ul>
            <button
              className="mt-6 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              type="button"
            >
              Back to top
            </button>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--line)] pt-5 text-xs text-[var(--muted-soft)] sm:mt-12 sm:pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Copyright {new Date().getFullYear()} Mountain Run</span>
            <span>India-wide virtual running events</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
