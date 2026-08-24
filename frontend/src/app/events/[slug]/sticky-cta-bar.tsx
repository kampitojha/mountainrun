"use client";

import Link from "next/link";
import { IndianRupee, Sparkles } from "lucide-react";
import { RegisterCta } from "../../components/register-cta";

function formatPrice(price: string) {
  return price.replace(/^Rs\.\s*/, "₹");
}

export function EventStickyCta({
  price,
  compareAtPrice,
  slug,
}: {
  price: string;
  compareAtPrice?: string;
  slug: string;
}) {
  const amount = price.toLowerCase().includes("free") ? "Free" : formatPrice(price);
  const mrp = compareAtPrice ? formatPrice(compareAtPrice) : undefined;

  return (
    <>
      {/* Spacer so page bottom content isn't covered */}
      <div className="h-24 md:hidden" aria-hidden="true" />

      {/* 100% Solid, Opaque & High-End Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-slate-950 dark:bg-[#080c14] border-t border-amber-500/30 shadow-[0_-16px_40px_rgba(0,0,0,0.75)] md:hidden">
        {/* Shimmer Accent Line */}
        <div className="h-0.5 w-full bg-linear-to-r from-transparent via-amber-400 to-transparent" />

        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {/* Price & Value Proposition */}
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-baseline gap-1.5">
              <span className="flex items-center text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                <IndianRupee className="h-4 w-4 mr-0.5 text-amber-400" />
                {amount}
              </span>
              {mrp ? (
                <span className="text-xs font-semibold text-slate-400 line-through">
                  {mrp}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 inline-flex items-center gap-1 truncate text-[0.6rem] font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-2.5 w-2.5 shrink-0" />
              Early Bird · Kit Included
            </p>
          </div>

          {/* Premium Glowing CTA Button */}
          <RegisterCta
            slug={slug}
            signedInLabel="Register now"
            signedOutLabel="Register now"
            className="shadow-lg shadow-(--gold)/25 transition-all duration-200 hover:brightness-110 active:scale-95 shrink-0 select-none text-xs sm:text-sm font-black tracking-wide"
          />
        </div>
      </div>
    </>
  );
}
