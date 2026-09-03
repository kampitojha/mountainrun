"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function EventBanner({ imageUrl, altText }: { imageUrl: string; altText: string }) {
  if (!imageUrl) return null;

  return (
    <section className="w-full bg-background py-6 sm:py-10 border-b border-(--line)">
      <div className="container-page">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-(--line) shadow-2xl bg-(--panel)"
        >
          <div className="relative aspect-video w-full md:aspect-21/9">
            <Image
              src={imageUrl}
              alt={altText}
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
