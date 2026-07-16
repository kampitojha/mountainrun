"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";

export function HomeCtas({ onDark = false }: { onDark?: boolean }) {
  const secondary = onDark ? "btn btn-on-dark" : "btn btn-secondary";

  return (
    <div className="btn-row mt-8 sm:mt-10">
      <Show when="signed-out">
        <Link className="btn btn-primary min-w-[10rem]" href="/register">
          Register now
        </Link>
        <Link className={`${secondary} min-w-[10rem]`} href="/events">
          Explore events
        </Link>
      </Show>
      <Show when="signed-in">
        <Link className="btn btn-primary min-w-[10rem]" href="/dashboard">
          My dashboard
        </Link>
        <Link className={`${secondary} min-w-[10rem]`} href="/register">
          Join event
        </Link>
      </Show>
    </div>
  );
}
