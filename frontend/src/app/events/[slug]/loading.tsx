import { PageShell } from "../../components/app-shell";
import { Breadcrumb } from "../../components/breadcrumb";

export default function EventDetailLoading() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-(--line)">
        <div className="hero-mesh-bg" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse 90% 60% at 50% -10%, color-mix(in srgb, var(--gold) 12%, transparent) 0%, transparent 55%)",
              "radial-gradient(ellipse 60% 50% at 100% 20%, color-mix(in srgb, var(--sage) 8%, transparent) 0%, transparent 60%)",
            ].join(", "),
          }}
        />

        <div className="container-page pb-16 pt-5 sm:pt-7">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
              { name: "Loading...", href: "#" },
            ]}
          />

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center xl:gap-16">
            {/* Left Column (Text & Skeleton) */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Event Badge Skeleton */}
              <div className="h-7 w-32 rounded-full bg-(--panel) border border-(--line) animate-pulse mb-4" />

              {/* Title Skeleton */}
              <div className="h-12 sm:h-16 w-3/4 rounded-xl bg-(--line) animate-pulse mb-4" />
              <div className="h-12 sm:h-16 w-1/2 rounded-xl bg-(--line) animate-pulse mb-6" />

              {/* Date & Location Skeleton */}
              <div className="flex gap-4 mb-8">
                <div className="h-6 w-24 rounded bg-(--panel-soft) animate-pulse" />
                <div className="h-6 w-24 rounded bg-(--panel-soft) animate-pulse" />
              </div>

              {/* Badges Skeleton */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 w-28 rounded-full bg-(--panel-soft) animate-pulse" />
                ))}
              </div>

              {/* CTA Skeleton */}
              <div className="h-14 w-full sm:w-64 rounded-2xl bg-(--sage-soft) animate-pulse" />
            </div>

            {/* Right Column (Image/Medal Skeleton) */}
            <div className="relative mx-auto w-full max-w-sm lg:mr-0 lg:max-w-md">
              <div className="aspect-[4/5] w-full rounded-[2.5rem] bg-(--panel-soft) border border-(--line) animate-pulse shadow-xl" />
            </div>
          </div>
        </div>
      </section>
      <div className="min-h-[50vh] bg-(--background)" />
    </PageShell>
  );
}
