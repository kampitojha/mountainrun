import Link from "next/link";
import { AppHeader } from "./components/app-header";

type IconName =
  | "run"
  | "shield"
  | "upload"
  | "award"
  | "truck"
  | "qr"
  | "chart"
  | "user"
  | "calendar"
  | "map"
  | "check"
  | "arrow";

const events = [
  {
    name: "Monsoon Mountain Miles",
    slug: "monsoon-mountain-miles",
    date: "11-17 Jul 2026",
    distance: "3K / 5K / 10K / 21K",
    price: "Rs. 499",
    status: "Open",
    slots: 72,
  },
  {
    name: "Independence Endurance Run",
    slug: "independence-endurance-run",
    date: "10-16 Aug 2026",
    distance: "5K / 10K / 25K",
    price: "Rs. 649",
    status: "Draft",
    slots: 46,
  },
  {
    name: "Himalayan Winter Sprint",
    slug: "himalayan-winter-sprint",
    date: "5-9 Dec 2026",
    distance: "2K / 5K / 10K",
    price: "Rs. 399",
    status: "Planning",
    slots: 28,
  },
];

const leaderboard = [
  ["01", "Aarav Sharma", "21K", "01:42:18", "Verified"],
  ["02", "Nisha Rawat", "10K", "00:49:02", "Verified"],
  ["03", "Kabir Sethi", "10K", "00:51:44", "Review"],
  ["04", "Meera Joshi", "5K", "00:24:19", "Verified"],
];

const designTokens = [
  ["Accent", "#B76E2A", "achievement, medal, momentum"],
  ["Surface", "#FFFDFA", "premium panels"],
  ["Ink", "#151512", "high contrast type"],
  ["Line", "#DEDAD0", "quiet structure"],
];

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    run: <><path d="M13 5.5a2 2 0 1 0-2.9-2.8A2 2 0 0 0 13 5.5Z" /><path d="m10 8 3.5 2.5 2.5-2" /><path d="m13.5 10.5-2 4.5 4.5 4" /><path d="M9.5 15 6 19.5" /></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" /><path d="m9 12 2 2 4-5" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    award: <><circle cx="12" cy="8" r="4" /><path d="m9.5 12-1 8 3.5-2 3.5 2-1-8" /></>,
    truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    qr: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" /><path d="M15 15h1v1h-1zM19 15h1v5h-5v-1M15 19h1" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15v-4M12 15V8M16 15v-7" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    calendar: <><path d="M7 3v4M17 3v4M4 8h16M5 5h14v16H5z" /></>,
    map: <><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" /><path d="M9 3v15M15 6v15" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border hairline bg-white/70 px-3 py-1 text-xs font-medium text-[var(--muted)]">
      {children}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
  href,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
}) {
  const styles = {
    primary: "bg-[var(--foreground)] text-white hover:bg-[var(--accent-dark)]",
    secondary: "border hairline bg-white text-[var(--foreground)] hover:border-[var(--accent)]",
    ghost: "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
  };
  const className = `focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${styles[variant]}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} type="button">
      {children}
    </button>
  );
}

export default function Home() {
  return (
    <main className="premium-shell min-h-screen">
      <AppHeader />

      <section className="hero-image relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
        <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_420px] lg:py-20">
          <div className="rise-in max-w-4xl text-white">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold text-white/86 backdrop-blur-xl">
              Virtual runs - GPS proof - UPI payments - medals
            </span>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Run your city. <span className="accent-text">Own the leaderboard.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              Mountain Run turns every GPS activity into a verified race result with Razorpay UPI registration, proof review, QR certificates, and medal delivery.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-bold text-white shadow-[0_18px_45px_rgba(255,107,53,0.32)] transition hover:bg-[var(--accent-dark)]" href="/register">
                Register now <Icon name="arrow" />
              </Link>
              <Link className="focus-ring inline-flex h-12 items-center justify-center rounded-lg border border-white/22 bg-white/12 px-5 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-white/20" href="/events">
                Explore events
              </Link>
            </div>
            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["2,480", "verified finishers"],
                ["14", "community events"],
                ["24h", "proof review"],
                ["UPI", "Razorpay ready"],
              ].map(([value, label]) => (
                <div className="glass-panel rounded-lg p-4 text-white" key={label}>
                  <p className="text-2xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-1 text-xs text-white/68">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="glass-panel rise-in rounded-lg p-4 text-white soft-shadow">
            <div className="rounded-lg bg-white p-5 text-[var(--foreground)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--accent-dark)]">Live event</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Monsoon Mountain Miles</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">11-17 Jul 2026 - run anywhere in India</p>
                </div>
                <span className="rounded-full bg-[var(--teal-soft)] px-3 py-1 text-xs font-bold text-[var(--teal)]">Open</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-sm">
                {["5K", "10K", "21K"].map((item) => (
                  <div key={item} className="rounded-lg bg-[var(--panel-strong)] p-3">
                    <p className="font-semibold">{item}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">distance</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--panel-strong)]">
                <div className="meter h-full w-[72%] rounded-full" />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>72% slots filled</span>
                <span>Certificate + medal</span>
              </div>
              <Link className="focus-ring mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--foreground)] text-sm font-bold text-white transition hover:bg-[var(--accent-dark)]" href="/register">
                Join this run
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section id="events" className="border-y hairline bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Badge>Upcoming challenges</Badge>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">Pick a distance. Run with energy. Finish with proof.</h2>
            </div>
            <Button href="/events" variant="secondary"><Icon name="calendar" /> View all events</Button>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {events.map((event, index) => (
              <article key={event.name} className="group overflow-hidden rounded-lg border hairline bg-white transition hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(16,21,19,0.12)]">
                <div className={`h-2 ${index === 0 ? "bg-[var(--accent)]" : index === 1 ? "bg-[var(--teal)]" : "bg-[var(--sun)]"}`} />
                <div className="p-5">
                <div className="flex items-center justify-between">
                  <Badge>{event.status}</Badge>
                  <span className="text-sm font-semibold">{event.price}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{event.name}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">{event.date}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{event.distance}</p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--panel-strong)]">
                  <div className="meter h-full rounded-full" style={{ width: `${event.slots}%` }} />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>{event.slots}% slots filled</span>
                  <span>Proof window enabled</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Certificate", "Medal", "Leaderboard"].map((benefit) => (
                    <span className="rounded-full bg-[var(--panel-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]" key={benefit}>
                      {benefit}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid gap-2">
                  <Link className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--foreground)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]" href={`/events/${event.slug}`}>
                    View details
                  </Link>
                  <Link className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg border hairline bg-white px-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]" href="/register">
                    Register
                  </Link>
                </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="mx-auto grid max-w-7xl gap-6 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge>Registration flow</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Clean forms, payment state, and proof review.</h2>
          <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
            The runner journey keeps friction low: account, distance, address, payment, GPS proof upload, verification, certificate preview, and medal tracking.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Accessible inputs", "Zod-ready validation", "Razorpay webhook states", "Cloudinary proof uploads"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border hairline bg-white p-4 text-sm font-medium">
                <Icon name="check" className="h-4 w-4 text-[var(--success)]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <form action="/leaderboard" className="rounded-lg border hairline bg-[var(--panel)] p-5 soft-shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">Full name<input className="focus-ring mt-2 h-11 w-full rounded-lg border hairline bg-white px-3 text-sm" defaultValue="Riya Mehta" /></label>
            <label className="text-sm font-medium">Distance<select className="focus-ring mt-2 h-11 w-full rounded-lg border hairline bg-white px-3 text-sm" defaultValue="10K"><option>5K</option><option>10K</option><option>21K</option></select></label>
            <label className="text-sm font-medium md:col-span-2">Shipping address<input className="focus-ring mt-2 h-11 w-full rounded-lg border hairline bg-white px-3 text-sm" defaultValue="Bandra West, Mumbai, Maharashtra" /></label>
          </div>
          <label className="mt-4 block cursor-pointer rounded-lg border border-dashed border-[var(--accent)] bg-[var(--accent-soft)]/45 p-6 text-center transition hover:bg-[var(--accent-soft)]">
            <Icon name="upload" className="mx-auto h-7 w-7 text-[var(--accent-dark)]" />
            <p className="mt-3 text-sm font-semibold">Upload GPS activity proof</p>
            <p className="mt-1 text-xs text-[var(--muted)]">PNG, JPG, or PDF from your running app</p>
            <input className="sr-only" name="proof" type="file" accept="image/png,image/jpeg,application/pdf" />
          </label>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["Payment", "Paid", "success"],
              ["Proof", "In review", "accent"],
              ["Certificate", "Queued", "muted"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-lg border hairline bg-white p-4">
                <p className="text-xs text-[var(--muted)]">{label}</p>
                <p className={`mt-2 text-sm font-semibold ${tone === "success" ? "text-[var(--success)]" : tone === "accent" ? "text-[var(--accent-dark)]" : "text-[var(--muted)]"}`}>{value}</p>
              </div>
            ))}
          </div>
          <button className="focus-ring mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]" type="submit">
            Submit proof demo
          </button>
        </form>
      </section>

      <section id="leaderboard" className="border-y hairline bg-[var(--panel)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-16 lg:grid-cols-[1fr_380px]">
          <div className="overflow-hidden rounded-lg border hairline bg-white">
            <div className="flex items-center justify-between border-b hairline p-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Live leaderboard</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Ranked after admin proof verification.</p>
              </div>
              <Button href="/leaderboard" variant="secondary"><Icon name="shield" /> Fair play</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--panel-strong)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                  <tr>{["Rank", "Runner", "Distance", "Time", "Status"].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr key={row[0]} className="border-t hairline">
                      {row.map((cell, index) => (
                        <td key={cell} className={`px-5 py-4 ${index === 1 ? "font-medium" : "text-[var(--muted)]"}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-lg border hairline bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">QR check-in</h3>
              <Icon name="qr" className="h-5 w-5 text-[var(--muted)]" />
            </div>
            <div className="mt-6 grid aspect-square place-items-center rounded-lg border hairline bg-[var(--panel-strong)]">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span key={i} className={`h-7 w-7 rounded-sm ${[0, 1, 4, 6, 8, 10, 12, 16, 18, 20, 21, 24].includes(i) ? "bg-[var(--foreground)]" : "bg-white"}`} />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Scan participant bib or certificate QR to confirm identity, proof status, payment, and dispatch eligibility.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge>What every runner gets</Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">Not just registration. A complete finish-line experience.</h2>
          </div>
          <Button href="/events"><Icon name="calendar" /> Choose an event</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["award", "E-certificate", "Download a polished QR-linked finisher certificate after proof approval."],
            ["truck", "Medal delivery", "Eligible finishers get medal dispatch and tracking updates."],
            ["shield", "Verified leaderboard", "GPS screenshots are reviewed before ranking goes public."],
            ["qr", "QR verification", "Anyone can scan and verify certificate, bib, and result authenticity."],
          ].map(([icon, title, text]) => (
            <div className="rounded-lg border hairline bg-white p-5 soft-shadow" key={title}>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--teal-soft)] text-[var(--teal)]">
                <Icon name={icon as IconName} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="rounded-lg border hairline bg-[var(--panel)] p-6 md:p-8">
          <Badge>Design system foundation</Badge>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {designTokens.map(([name, color, use]) => (
              <div key={name} className="rounded-lg border hairline bg-white p-4">
                <span className="block h-12 rounded-lg border hairline" style={{ background: color }} />
                <p className="mt-4 text-sm font-semibold">{name}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{color} - {use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
