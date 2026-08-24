import Link from "next/link";
import { Heart } from "lucide-react";
import { Reveal, SectionHeader } from "./reveal";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const posts = [
  {
    src: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=400&h=400&q=80",
    name: "Rohan K.",
    city: "Mumbai",
    quote: "Got my medal within 5 days! Best virtual run ever.",
  },
  {
    src: "https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=400&h=400&q=80",
    name: "Priya M.",
    city: "Bangalore",
    quote: "The T-shirt quality is insane. Will run again.",
  },
  {
    src: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400&q=80",
    name: "Amit S.",
    city: "Delhi",
    quote: "Smooth tracking with Strava. Loved the gold medal.",
  },
  {
    src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&h=400&q=80",
    name: "Sneha R.",
    city: "Pune",
    quote: "Completed my first 10K! Thank you for the motivation.",
  },
];

export function EventCommunity() {
  return (
    <section className="section border-b border-(--line)">
      <div className="container-page">
        <SectionHeader
          eyebrow="The community"
          title={
            <>
              Real runners. Real medals.{" "}
              <span className="text-gold">Real moments.</span>
            </>
          }
          lead="Join 25,000+ runners who made Mountain Run part of their journey."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {posts.map((post, i) => (
            <Reveal key={post.name} delay={i * 0.07}>
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-(--line) bg-(--panel) transition-all duration-300 hover:-translate-y-1 hover:border-(--gold-line) hover:shadow-premium">
                <div className="relative aspect-square overflow-hidden border-b border-(--line)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.src}
                    alt={`Runner ${post.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 backdrop-blur-md">
                    <InstagramGlyph className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="text-sm italic leading-relaxed text-(--foreground)">
                    &quot;{post.quote}&quot;
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs font-bold text-(--gold-deep)">{post.name}</p>
                    <p className="text-[0.65rem] font-medium uppercase tracking-wider text-(--muted-soft)">
                      {post.city}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 text-center">
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--panel) px-5 py-2.5 text-sm font-bold text-(--foreground) shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-(--gold-line) hover:shadow-premium"
          >
            <InstagramGlyph className="h-4 w-4 text-(--gold-deep)" />
            Follow @mountainrun
          </Link>
        </Reveal>
      </div>
    </section>
  );
}