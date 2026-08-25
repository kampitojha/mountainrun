"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isVisible, setIsVisible] = useState(false);
  const amount = price.toLowerCase().includes("free") ? "Free" : formatPrice(price);
  const mrp = compareAtPrice ? formatPrice(compareAtPrice) : undefined;

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA only after scrolling past the hero action (360px)
      if (window.scrollY > 360) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-(--gold-line)/40 bg-[#0c0c10]/95 backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.85)] md:hidden"
        >
          {/* Shimmer Accent Top Line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-(--gold) to-transparent opacity-80" />

          <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Price & Value Proposition */}
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5">
                <span className="flex items-center text-lg font-black tracking-tight text-white">
                  {amount}
                </span>
                {mrp ? (
                  <span className="text-xs font-semibold text-(--muted) line-through">
                    {mrp}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 inline-flex items-center gap-1 truncate text-[0.62rem] font-bold uppercase tracking-wider text-(--gold-deep)">
                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                3D Medal Kit Included
              </p>
            </div>

            {/* Premium CTA Button */}
            <RegisterCta
              slug={slug}
              signedInLabel="Register now"
              signedOutLabel="Register now"
              className="btn-gold shrink-0 rounded-xl px-5 py-2.5 text-xs font-black tracking-wide shadow-md transition-transform active:scale-95"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
