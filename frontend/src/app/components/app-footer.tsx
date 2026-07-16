"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)]">
      <div className="container-page py-8 sm:py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
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
              Virtual races with verified finishes, clean leaderboards, medals, merch,
              and simple post-run proof upload.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-soft)]">
                Explore
              </p>
              <ul className="mt-3 space-y-2.5 text-sm text-[var(--muted)]">
                <li>
                  <Link className="hover:text-[var(--foreground)]" href="/events">
                    Events
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--foreground)]" href="/gallery">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--foreground)]" href="/about">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--foreground)]" href="/leaderboard">
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
                    <Link className="hover:text-[var(--foreground)]" href="/sign-in">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-[var(--foreground)]" href="/events">
                      Join a run
                    </Link>
                  </li>
                </Show>
                <Show when="signed-in">
                  <li>
                    <Link className="hover:text-[var(--foreground)]" href="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-[var(--foreground)]" href="/register">
                      Join event
                    </Link>
                  </li>
                </Show>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--line)] pt-5 text-xs text-[var(--muted-soft)] sm:mt-10 sm:pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Copyright {new Date().getFullYear()} Mountain Run</span>
            <span>Support: hello@mountainrun.in | India-wide virtual events</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
