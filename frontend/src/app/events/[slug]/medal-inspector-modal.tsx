"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
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
        setIsZoomed(false);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${eventName} Finisher Medal 4K Inspector`}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-(--gold-line) bg-[#101014] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(201,162,39,0.22)]"
          >
            {/* Minimalist Top Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#14141a]/95 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--gold-soft) text-(--gold-deep)">
                  <Award className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                    {eventName}
                  </h3>
                  <p className="text-[0.62rem] font-semibold text-(--gold-deep) uppercase tracking-wider">
                    Official Finisher Medal · 3D High Relief
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-(--gold-line) hover:text-(--gold-deep)"
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
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-(--muted) transition-colors hover:bg-white/15 hover:text-white"
                  aria-label="Close inspector"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Full-Size Medal Canvas (Zero Obstructing Text) */}
            <div className="relative flex min-h-[380px] sm:min-h-[480px] flex-1 items-center justify-center overflow-auto bg-gradient-to-b from-[#08080a] via-[#101015] to-[#08080a] p-3 sm:p-6">
              {/* Radial ambient gold halo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201, 162, 39, 0.22) 0%, rgba(45, 212, 191, 0.04) 50%, transparent 80%)",
                }}
              />

              {/* Medal Image Display */}
              <div
                onClick={() => setIsZoomed(!isZoomed)}
                className={`relative flex items-center justify-center cursor-zoom-in transition-transform duration-300 ${
                  isZoomed ? "scale-150 cursor-zoom-out" : "scale-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${eventName} Official Finisher Medal`}
                  className="max-h-[64vh] sm:max-h-[68vh] w-auto max-w-full rounded-2xl object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

            {/* Clean Action Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#14141a]/95 px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary !py-2.5 !px-5 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <Link
                href={`/register?event=${encodeURIComponent(slug)}`}
                className="btn btn-gold !py-2.5 !px-6 gap-1.5 text-xs font-black rounded-xl shadow-lg shadow-(--gold)/20"
                onClick={onClose}
              >
                Register {price ? `(${price})` : "Now"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
