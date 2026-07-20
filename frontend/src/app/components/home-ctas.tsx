"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";

export function HomeCtas() {
  return (
    <div className="btn-row mt-8 justify-center sm:mt-10">
      <Show when="signed-out">
        <Link className="btn btn-primary min-w-[10rem]" href="/events">
          Browse events
        </Link>
        <Link className="btn btn-secondary min-w-[10rem]" href="/sign-up">
          Create account
        </Link>
      </Show>
      <Show when="signed-in">
        <Link className="btn btn-primary min-w-[10rem]" href="/dashboard">
          My dashboard
        </Link>
        <Link className="btn btn-secondary min-w-[10rem]" href="/events">
          Join event
        </Link>
      </Show>
    </div>
  );
}
