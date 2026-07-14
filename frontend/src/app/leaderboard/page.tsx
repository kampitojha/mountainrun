import { PageShell } from "../components/app-shell";

const rows = [
  ["01", "Aarav Sharma", "21K", "01:42:18", "Verified"],
  ["02", "Nisha Rawat", "10K", "00:49:02", "Verified"],
  ["03", "Kabir Sethi", "10K", "00:51:44", "Review"],
  ["04", "Meera Joshi", "5K", "00:24:19", "Verified"],
];

export default function LeaderboardPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-5 md:py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Leaderboard</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Only approved GPS proof appears here.</p>
        <div className="mt-8 overflow-hidden rounded-lg border hairline bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[var(--panel-strong)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>{["Rank", "Runner", "Distance", "Time", "Status"].map((head) => <th className="px-5 py-3" key={head}>{head}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-t hairline" key={row[0]}>
                    {row.map((cell, index) => <td className={`px-5 py-4 ${index === 1 ? "font-medium" : "text-[var(--muted)]"}`} key={cell}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
