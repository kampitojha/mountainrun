import Link from "next/link";
import { PageHeader, PageShell } from "../components/app-shell";

const values = [
  ["Simple participation", "Register, run, upload proof, and track your progress without confusing steps."],
  ["Fair verification", "GPS proof and admin review keep leaderboards cleaner for every runner."],
  ["Memorable rewards", "Certificates, medals, and event merchandise turn a solo run into a finish-line moment."],
];

export default function AboutPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page">
          <PageHeader
            eyebrow="About"
            title="Virtual runs with real finish energy"
            description="Mountain Run helps runners join organised virtual events from anywhere, submit verified proof, and celebrate with rankings, certificates, medals, and merch."
            action={
              <Link className="btn btn-primary w-full sm:w-auto" href="/events">
                Browse events
              </Link>
            }
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map(([title, text]) => (
              <article className="card p-5 sm:p-6" key={title}>
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 grid gap-8 rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 sm:p-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="eyebrow">Event support</p>
              <h2 className="heading mt-3">For runners, clubs, and communities</h2>
              <p className="lede mt-4">
                We focus on the operational pieces that make virtual races feel trustworthy:
                clear event details, reliable registration, proof collection, leaderboard
                publishing, and reward fulfilment.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-[var(--muted)]">
              <p className="rounded-lg bg-[var(--panel-soft)] p-4">
                Email: hello@mountainrun.in
              </p>
              <p className="rounded-lg bg-[var(--panel-soft)] p-4">
                Coverage: India-wide virtual running events
              </p>
              <p className="rounded-lg bg-[var(--panel-soft)] p-4">
                Rewards: medals, certificates, T-shirts, and event merch
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
