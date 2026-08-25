"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

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
  const mrp = compareAtPrice ? formatPrice(compareAtPrice) : "₹799";

  return (
    <>
      {/* Spacer so bottom section content is never blocked on mobile */}
      <div className="h-24 md:hidden" aria-hidden="true" />

      {/* Fixed Mobile Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-500/30 bg-[#090a0f]/95 backdrop-blur-xl shadow-[0_-12px_40px_rgba(0,0,0,0.9)] md:hidden">
        {/* Subtle Top Gold Shimmer Line */}
        <div className="h-[2px] w-full bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {/* Left: Pricing & Value Tag */}
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-mono">
                {amount}
              </span>
              <span className="text-xs font-semibold text-zinc-400 line-through decoration-zinc-400/80">
                {mrp}
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[0.6rem] font-black text-emerald-400 border border-emerald-500/30">
                50% OFF
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[0.62rem] font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-2.5 w-2.5 shrink-0" />
              3D Medal Kit Included
            </p>
          </div>

          {/* Right: Premium Register Button */}
          <Link
            href={`/register?event=${encodeURIComponent(slug)}`}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2.5 text-xs font-black tracking-wide text-slate-950 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
          >
            <span>Register now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
