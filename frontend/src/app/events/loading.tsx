import { FileText, Medal, Shirt, Trophy } from "lucide-react";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";

export default function EventsLoading() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-(--line)">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div aria-hidden className="pointer-events-none absolute top-8 right-8 flex gap-1.5 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-(--sage) animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="container-page py-8 sm:py-12">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Events", href: "/events" },
            ]}
          />

          <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--gold-line) bg-(--gold-soft) px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-widest text-(--gold-deep) shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Pan-India Virtual Running Events
            </div>

            <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Find your next <span className="text-gradient-premium">virtual race</span>
            </h1>

            <p className="lede mx-auto mt-3 max-w-xl text-sm sm:text-base text-(--muted)">
              Run anywhere at your own pace with Strava, Nike, or Garmin. Complete your distance and claim authentic heavy metal finisher medals delivered to your doorstep.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "Heavy Metal Medals", icon: Medal },
                { label: "DRI-FIT T-Shirts", icon: Shirt },
                { label: "Official Certificate", icon: FileText },
                { label: "National Leaderboard", icon: Trophy },
              ].map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-(--panel-soft)/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-xs shadow-xs"
                >
                  <Icon className="h-3.5 w-3.5 text-(--gold)" strokeWidth={1.75} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-page">
          <div className="flex flex-col gap-8 md:flex-row md:items-start lg:gap-12">
            {/* Sidebar Skeleton */}
            <div className="hidden w-64 shrink-0 md:block">
              <div className="space-y-6">
                <div>
                  <div className="mb-3 h-5 w-24 rounded-md bg-(--line) animate-pulse" />
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 w-full rounded-lg bg-(--panel-soft) animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="flex-1">
              <div className="mb-6 h-6 w-48 rounded-md bg-(--line) animate-pulse" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-(--line) bg-(--panel) shadow-sm">
                    {/* Image Placeholder */}
                    <div className="relative aspect-[4/3] w-full bg-(--panel-soft) animate-pulse" />
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="mb-3 h-5 w-3/4 rounded bg-(--line) animate-pulse" />
                      <div className="mb-4 h-4 w-1/2 rounded bg-(--panel-soft) animate-pulse" />
                      <div className="mt-auto flex gap-2">
                        <div className="h-9 flex-1 rounded-xl bg-(--panel-soft) animate-pulse" />
                        <div className="h-9 flex-1 rounded-xl bg-(--line) animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
