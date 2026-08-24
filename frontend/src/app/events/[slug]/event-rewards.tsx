import { MapPinned, Smartphone, ArrowUpRight, FileBadge, Medal, Shirt, Sparkles, Trophy, Truck } from "lucide-react";
import { Medal3D } from "./medal";
import { Reveal, SectionHeader } from "./reveal";

const mergedFeatures = [
  {
    icon: MapPinned,
    title: "Run anywhere",
    desc: "Park, road, or treadmill — no travel, no city limits.",
  },
  {
    icon: Smartphone,
    title: "Track & Verify",
    desc: "Use Strava or Garmin. A real team verifies every finish.",
  },
  {
    icon: Medal,
    title: "Finisher medal",
    desc: "A heavyweight metal medal, designed to be worn.",
  },
  {
    icon: Shirt,
    title: "Premium T-shirt",
    desc: "Exclusive athletic-fit tee included with every kit.",
  },
  {
    icon: FileBadge,
    title: "Official certificate",
    desc: "Your verified time on a real printed certificate.",
  },
  {
    icon: Truck,
    title: "Free delivery",
    desc: "Everything ships free to your door across India.",
  },
];

export function EventRewards({ event }: { event?: { medalImageUrl?: string | null } }) {
  const hasMedalImage = !!event?.medalImageUrl;

  return (
    <section id="rewards" className="section scroll-mt-24 border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="Why this event"
          title={
            <>
              Run your way, earn a{" "}
              <span className="text-gold">premium reward</span>
            </>
          }
          lead="No crowds, no pressure. Just you, your distance, and a complete reward kit built to be remembered."
        />

        <div className="mt-8 grid items-start gap-6 sm:mt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* Merged Feature Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mergedFeatures.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.05}>
                <article className="group flex flex-col items-start gap-3 rounded-2xl border border-(--line) bg-(--panel) p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--gold-line) hover:shadow-premium sm:p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--gold-line) bg-gradient-to-br from-(--gold-soft) to-white/5 text-(--gold-deep) shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold tracking-tight text-(--foreground)">
                      {title}
                    </h3>
                    <p className="mt-1 text-[0.7rem] leading-relaxed text-(--muted) sm:text-xs">{desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Product showcase */}
          <Reveal delay={0.1} className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[2rem] border border-(--gold-line) bg-gradient-to-b from-(--gold-soft) via-(--panel) to-(--panel)">
              <div
                aria-hidden
                className="sun-pulse pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(240,217,135,0.55) 0%, rgba(201,162,39,0.18) 45%, transparent 70%)",
                }}
              />

              <div className="relative flex items-center justify-center px-6 pt-10 min-h-[300px]">
                {hasMedalImage ? (
                  <div className="medal-float w-44 drop-shadow-[0_35px_40px_rgba(122,92,8,0.35)] sm:w-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={event.medalImageUrl!} 
                      alt="Finisher Medal" 
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="medal-float w-44 sm:w-56 relative flex flex-col items-center justify-center aspect-[3/4] rounded-[3rem] border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden">
                    {/* Inner glowing shimmer for the glass */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.2)_0%,transparent_70%)] mix-blend-overlay" />
                    
                    <Medal className="h-16 w-16 text-white/50 mb-3 drop-shadow-md" strokeWidth={1} />
                    <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
                      Revealing Soon ✨
                    </span>
                  </div>
                )}
              </div>

              {/* Floating mini chips */}
              <div className="badge-float glass-pill absolute left-4 top-8 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-bold text-(--foreground) shadow-sm sm:left-7 sm:top-10">
                <Shirt className="h-3.5 w-3.5 text-(--gold-deep)" />
                Premium T-shirt
              </div>
              <div
                className="badge-float glass-pill absolute bottom-24 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-bold text-(--foreground) shadow-sm sm:bottom-28 sm:right-6"
                style={{ animationDelay: "1.2s", ["--tilt" as string]: "4deg" }}
              >
                <FileBadge className="h-3.5 w-3.5 text-(--gold-deep)" />
                Official certificate
              </div>
              <div
                className="badge-float glass-pill absolute bottom-12 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-bold text-(--foreground) shadow-sm sm:bottom-16 sm:left-6"
                style={{ animationDelay: "0.6s", ["--tilt" as string]: "-4deg" }}
              >
                <Truck className="h-3.5 w-3.5 text-(--gold-deep)" />
                Free delivery
              </div>

              {/* Footer tag */}
              <div className="relative border-t border-(--gold-line) px-6 py-5 text-center">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--gold-deep)">
                  <Sparkles className="h-3.5 w-3.5" />
                  Kit worth ₹900+ · included with every entry
                </p>
                <Link
                  className="group mt-2 inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-widest text-(--muted) transition-colors hover:text-(--sage)"
                  href="/register"
                >
                  Claim yours
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
