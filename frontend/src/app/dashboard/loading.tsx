import { PageShell } from "../components/app-shell";

export default function DashboardLoading() {
  return (
    <PageShell footerMode="minimal">
      <section className="page-section">
        <div className="container-page max-w-5xl">
          <div className="flex animate-pulse flex-col gap-6 pt-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 border-b border-(--line) pb-6">
              <div className="h-16 w-16 shrink-0 rounded-full bg-(--line)" />
              <div className="flex flex-col gap-2">
                <div className="h-6 w-48 rounded bg-(--line)" />
                <div className="h-4 w-32 rounded bg-(--panel-soft)" />
              </div>
            </div>

            {/* Dashboard grid skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Main Content Area */}
              <div className="md:col-span-2 space-y-6">
                {/* Active Registrations Skeleton */}
                <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-sm">
                  <div className="mb-4 h-6 w-40 rounded bg-(--line)" />
                  <div className="h-32 w-full rounded-xl bg-(--panel-soft)" />
                </div>
                {/* Past Registrations Skeleton */}
                <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-sm">
                  <div className="mb-4 h-6 w-40 rounded bg-(--line)" />
                  <div className="h-24 w-full rounded-xl bg-(--panel-soft)" />
                </div>
              </div>

              {/* Sidebar Area */}
              <div className="space-y-6">
                {/* Stats Skeleton */}
                <div className="rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-sm">
                  <div className="mb-4 h-6 w-32 rounded bg-(--line)" />
                  <div className="space-y-3">
                    <div className="h-12 w-full rounded-xl bg-(--panel-soft)" />
                    <div className="h-12 w-full rounded-xl bg-(--panel-soft)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
