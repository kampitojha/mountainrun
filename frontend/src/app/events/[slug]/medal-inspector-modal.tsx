"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface MedalInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  eventName: string;
  slug: string;
  price?: string;
}

export function MedalInspectorModal({
  isOpen,
  onClose,
  imageUrl,
  eventName,
  slug,
  price,
}: MedalInspectorModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Close on Escape key press and prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset zoom on modal open/close
  useEffect(() => {
    if (isOpen) {
      setIsZoomed(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${eventName} Finisher Medal 4K Inspector`}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-(--gold-line) bg-(--panel) shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(201,162,39,0.2)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-(--line) bg-(--panel-soft) px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--gold-soft) text-(--gold-deep)">
                  <Award className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-(--foreground) sm:text-base">
                    {eventName} · Official Finisher Medal
                  </h3>
                  <p className="text-[0.65rem] font-semibold text-(--muted) uppercase tracking-wider">
                    High Definition 4K Showcase · 100% Solid Metal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--panel) px-3 py-1.5 text-xs font-semibold text-(--foreground) transition-colors hover:border-(--gold-line) hover:text-(--gold-deep)"
                  title={isZoomed ? "Zoom out" : "Zoom in"}
                >
                  {isZoomed ? (
                    <>
                      <ZoomOut className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Fit view</span>
                    </>
                  ) : (
                    <>
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">2x Zoom</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-(--line) bg-(--panel) text-(--muted) transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close inspector"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Interactive Canvas Area */}
            <div className="relative flex min-h-[360px] flex-1 items-center justify-center overflow-auto bg-gradient-to-b from-[#09090b] via-[#111116] to-[#09090b] p-4 sm:p-8">
              {/* Radial ambient gold halo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(201, 162, 39, 0.18) 0%, rgba(45, 212, 191, 0.04) 50%, transparent 80%)",
                }}
              />

              {/* Medal Image Display */}
              <div
                onClick={() => setIsZoomed(!isZoomed)}
                className={`relative cursor-zoom-in transition-transform duration-300 ${
                  isZoomed ? "scale-150 cursor-zoom-out" : "scale-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${eventName} Finisher Medal Details`}
                  className="max-h-[58vh] w-auto max-w-full rounded-2xl object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Floating Feature Badges */}
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 sm:bottom-6 sm:left-6 sm:right-6">
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-bold text-white shadow-md">
                  <Sparkles className="h-3 w-3 text-(--gold)" />
                  Front: 3D High Relief Athletes
                </span>
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-bold text-white shadow-md">
                  <ShieldCheck className="h-3 w-3 text-(--gold)" />
                  Back: &quot;Finish with Pride Leave a Legacy&quot;
                </span>
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-bold text-white shadow-md">
                  <Truck className="h-3 w-3 text-(--sage)" />
                  Free Tracked Courier Delivery
                </span>
              </div>
            </div>

            {/* Footer / CTA Bar */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-(--line) bg-(--panel-soft) px-5 py-4 sm:flex-row sm:px-6">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-(--foreground)">
                  Want to earn this official medal?
                </p>
                <p className="text-[0.7rem] text-(--muted)">
                  Register now, record with any GPS app, and it ships straight to your address upon finish verification.
                </p>
              </div>

              <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary flex-1 text-xs sm:flex-initial"
                >
                  Close
                </button>
                <Link
                  href={`/register?event=${encodeURIComponent(slug)}`}
                  className="btn btn-gold flex-1 gap-1.5 text-xs sm:flex-initial"
                  onClick={onClose}
                >
                  Register {price ? `(${price})` : "Now"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
