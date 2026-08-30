import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";

export default function LeaderboardLoading() {
  return (
    <PageShell>
      <section className="page-section">
        <div className="container-page max-w-5xl">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Leaderboard", href: "/leaderboard" },
            ]}
          />
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-(--panel) py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-(--line) border-t-(--sage)" />
            <p className="mt-4 text-sm font-medium text-(--muted)">Loading leaderboard...</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
