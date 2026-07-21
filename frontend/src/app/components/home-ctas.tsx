"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

export function HomeCtas() {
  return (
    <div className="btn-row mt-8 justify-center sm:mt-10">
      <Show when="signed-out">
        <Link className="btn btn-primary min-w-[10rem]" href="/events">
          Browse events
        </Link>
        <Link className="btn btn-secondary min-w-[10rem] gap-2" href="/sign-in">
          <LogIn className="h-4 w-4 shrink-0" />
          Sign in
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
