import { FileBadge, Route, ShieldCheck, Truck } from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { Reveal, SectionHeader } from "./reveal";

export function EventHow({ event }: { event: PublicEvent }) {
  const steps = [
    {
      icon: ShieldCheck,
      title: "Register & pay",
      desc: "Choose your distance and finish payment via UPI in under two minutes.",
    },
    {
      icon: Route,
      title: `Run anytime · ${event.date}`,
      desc: "Finish your distance anywhere, at any hour — park, road or treadmill.",
    },
    {
      icon: FileBadge,
      title: "Submit proof",
      desc: "Upload your GPS activity from your dashboard. A real team verifies it.",
    },
    {
      icon: Truck,
      title: "Receive rewards",
      desc: "Your medal, certificate and kit ship free to your doorstep.",
    },
  ];

  return (
    <section className="section border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="How it works"
          title={
            <>
              Four steps to a{" "}
              <span className="text-gradient-premium">verified finish</span>
            </>
          }
          lead="You stay in your routine. We handle everything else — proof, verification and delivery."
        />

        <div className="relative mt-8 sm:mt-10">
          {/* Desktop connector */}
          <div
            aria-hidden
            className="absolute inset-x-16 top-6 hidden h-0.5 bg-gradient-to-r from-(--gold) via-(--sage) to-(--gold) opacity-25 sm:block"
          />

          <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.12} className="relative w-[75vw] max-w-[280px] shrink-0 snap-center sm:w-auto sm:max-w-none">
                <div className="relative flex flex-col items-start sm:items-center sm:text-center">
                  <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl grad-gold text-white shadow-gold sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>

                  <div className="mt-3.5 w-full flex-1 rounded-2xl border border-(--line) bg-(--panel) p-4 transition-all duration-300 hover:-translate-y-1 hover:border-(--gold-line) hover:shadow-premium sm:p-5">
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-(--gold-deep)">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-1.5 text-sm font-bold tracking-tight text-(--foreground)">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-(--muted)">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
