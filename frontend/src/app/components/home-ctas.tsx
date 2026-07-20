"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Show } from "@clerk/nextjs";
import type { ReactNode } from "react";

function MotionCta({
  className,
  href,
  children,
}: {
  className: string;
  href: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="inline-flex w-full sm:w-auto"
      whileHover={reduce ? undefined : { y: -3, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      <Link className={`${className} w-full`} href={href}>
        {children}
      </Link>
    </motion.div>
  );
}

/** Homepage hero CTAs — full-width stack on small phones */
export function HomeCtas() {
  return (
    <div className="btn-row mt-8 justify-center sm:mt-10">
      <Show when="signed-out">
        <MotionCta className="btn btn-primary min-w-[10rem]" href="/events">
          Browse events
        </MotionCta>
        <MotionCta className="btn btn-secondary min-w-[10rem]" href="/sign-up">
          Create account
        </MotionCta>
      </Show>
      <Show when="signed-in">
        <MotionCta className="btn btn-primary min-w-[10rem]" href="/dashboard">
          My dashboard
        </MotionCta>
        <MotionCta className="btn btn-secondary min-w-[10rem]" href="/events">
          Join event
        </MotionCta>
      </Show>
    </div>
  );
}
