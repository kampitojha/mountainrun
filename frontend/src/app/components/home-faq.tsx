"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { HomeSectionHeader } from "./home-section-header";

type FaqItem = {
  question: string;
  answer: string;
};

const homeFaqs: FaqItem[] = [
  {
    question: "What is a virtual run / marathon and how does Mountain Run work in India?",
    answer:
      "A virtual run or online marathon allows you to run anywhere across India—outdoors or on a treadmill—at your own pace and schedule. Choose an event, pick your distance (1.5K, 3K, 5K, 10K, 21K Half Marathon), and run anytime during the event window. Track with any GPS app (Strava, Garmin, Nike Run Club, Apple Fitness, Google Fit) and upload your activity screenshot to your runner dashboard. Once verified by our arbiters, your official E-Certificate is unlocked instantly and your authentic metal finisher medal and running kit are dispatched to your doorstep.",
  },
  {
    question: "What distances and running categories are available?",
    answer:
      "We offer categories for every runner: 1.5 km and 3 km (Starter & Youth), 5 km / 5K (Beginners & Fun Run), 10 km / 10K (Endurance Challenge), 21 km / 21K (Half Marathon), as well as Virtual Cycling and Walking challenges. Every distance entry receives the complete finisher rewards kit.",
  },
  {
    question: "Do I get a real metal finisher medal, DRI-FIT t-shirt, and certificate?",
    answer:
      "Yes! Every verified finisher receives an authentic, heavy die-cast metal finisher medal, custom DRI-FIT event t-shirt, and an official verifiable E-Certificate with a unique QR code. Kits are dispatched via express tracked courier with zero delivery charges across all 19,000+ Indian pincodes.",
  },
  {
    question: "Which GPS tracking apps and smartwatches are supported for run proof?",
    answer:
      "We support all major running platforms including Strava, Garmin Connect, Nike Run Club (NRC), Adidas Running, Apple Watch / Apple Fitness, Samsung Health, Google Fit, Coros, and Suunto. Treadmill console photos showing elapsed time and distance are also fully supported.",
  },
  {
    question: "Can beginners, kids, women, and families participate?",
    answer:
      "Absolutely! Mountain Run is designed for all fitness levels. We welcome beginners, joggers, kids, women runners, and families. You can walk, jog, or sprint at your own comfortable pace to complete your goal.",
  },
  {
    question: "Do you deliver finisher medals to all cities across India?",
    answer:
      "Yes, we deliver with 100% free shipping to all 19,000+ pincodes across India—covering Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Chandigarh, Lucknow, Kochi, and all tier-2/tier-3 cities.",
  },
  {
    question: "How do I check upcoming virtual marathons and running events for 2026?",
    answer:
      "You can browse our upcoming virtual running events calendar directly on the Mountain Run Events page. Choose any open challenge, complete online registration in 2 minutes, and start running!",
  },
];

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section border-b border-(--line) bg-(--panel)">
      <div className="container-page">
        <HomeSectionHeader
          align="left"
          eyebrow="Frequently Asked Questions"
          title="Everything you need to know about virtual races"
          lead="Got questions about GPS verification, medals, or certificate delivery? We've got answers."
        />

        <div className="mx-auto mt-8 max-w-3xl space-y-3 sm:mt-12 sm:space-y-4">
          {homeFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel-soft) transition-colors hover:border-(--line-strong)"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left font-bold text-sm text-foreground sm:p-5 sm:text-base"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 shrink-0 text-(--sage)" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-(--muted) transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-(--sage)" : ""
                    }`}
                  />
                </button>

                {isOpen ? (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                    <p className="text-xs leading-relaxed text-(--muted) sm:text-sm sm:leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
