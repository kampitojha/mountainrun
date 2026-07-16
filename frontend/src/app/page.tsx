import Link from "next/link";
import { AppFooter } from "./components/app-footer";
import { AppHeader } from "./components/app-header";
import { Countdown } from "./components/countdown";
import { CountUp } from "./components/count-up";
import { FloatCta } from "./components/float-cta";
import { HomeCtas } from "./components/home-ctas";
import { ScrollProgress } from "./components/scroll-progress";
import { SectionRidge } from "./components/section-ridge";
import { galleryMoments, publicEvents } from "./data/events";

const steps = [
  {
    step: "01",
    title: "Choose your run",
    text: "Pick an event, distance, and reward kit before you register.",
  },
  {
    step: "02",
    title: "Run and upload proof",
    text: "Finish anywhere, then submit your GPS activity screenshot.",
  },
  {
    step: "03",
    title: "Get verified rewards",
    text: "Unlock leaderboard rank, certificate, medal, and selected merch.",
  },
];

const rewards = [
  ["Finisher medal", "A physical medal shipped after your proof is verified."],
  ["E-certificate", "QR-linked certificate for every verified finisher."],
  ["Merch and T-shirt", "Optional event merchandise for premium race kits."],
  ["Leaderboard rank", "Public result listing for verified submissions."],
];

const reviews = [
  {
    name: "Aarav Sharma",
    run: "10 km finisher",
    text: "Registration was simple and the proof upload was clear. Getting my certificate the same week felt great.",
  },
  {
    name: "Nisha Verma",
    run: "5 km beginner",
    text: "I liked that I could run in my own city but still feel part of an event. The medal made it memorable.",
  },
  {
    name: "Rohan Mehta",
    run: "21 km finisher",
    text: "The leaderboard gave my long run a real target. Clean experience from payment to verification.",
  },
];

export default function Home() {
  const previewEvents = publicEvents.slice(0, 3);
  const nextEvent = previewEvents[0];

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <ScrollProgress />
      <AppHeader />

      <main className="flex-1">
        <section className="hero">
          <div className="hero-media" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src="/images/mountain-run-hero.png"
              width={1920}
              height={1080}
              fetchPriority="high"
            />
          </div>
          <div className="hero-overlay" aria-hidden />
          <div className="hero-fog" aria-hidden />

          <div className="container-page fade-up w-full pb-12 pt-28 sm:pb-16 sm:pt-32 lg:pb-20">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                  Virtual mountain series
                </p>
                <h1 className="display mt-4 text-white">
                  Run beyond
                  <br />
                  the ordinary.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/72 sm:text-lg">
                  Verified virtual races with GPS proof, ranked finishes, medals,
                  and certificates — built for runners who want a clean event
                  experience anywhere in India.
                </p>
                <HomeCtas onDark />

                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/12 pt-6">
                  <div className="stat-chip">
                    <strong>
                      <CountUp value={5000} suffix="+" />
                    </strong>
                    <span>Runners</span>
                  </div>
                  <div className="stat-chip">
                    <strong>
                      <CountUp value={48} suffix="+" />
                    </strong>
                    <span>Cities</span>
                  </div>
                  <div className="stat-chip">
                    <strong>
                      {nextEvent?.date ?? "Open"}
                    </strong>
                    <span>Next window</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 lg:items-end">
                <Countdown targetIso="2026-07-11T00:00:00.000Z" />
                {nextEvent ? (
                  <div className="glass-panel w-full max-w-sm p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
                      Featured event
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                      {nextEvent.name}
                    </p>
                    <p className="mt-1 text-sm text-white/65">
                      {nextEvent.distance} · {nextEvent.price}
                    </p>
                    <Link
                      className="btn btn-primary mt-5 h-10 w-full"
                      href={`/events/${nextEvent.slug}`}
                    >
                      View event
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <SectionRidge />

        <section className="section">
          <div className="container-page">
            <div className="max-w-xl">
              <p className="eyebrow">How it works</p>
              <h2 className="heading mt-3 sm:mt-4">Three steps to the finish</h2>
            </div>
            <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3">
              {steps.map((item) => (
                <div className="card card-hover p-5 sm:p-6" key={item.step}>
                  <p className="text-xs font-medium tracking-[0.14em] text-[var(--muted-soft)]">
                    {item.step}
                  </p>
                  <h3 className="mt-3 text-base font-semibold tracking-tight sm:mt-4 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section border-y border-[var(--line)] bg-white/70">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="eyebrow">Upcoming</p>
                <h2 className="heading mt-3 sm:mt-4">Open events</h2>
                <p className="lede mt-3">
                  Choose your distance, view the reward kit, and register from the event page.
                </p>
              </div>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/events">
                View all events
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
              {previewEvents.map((event) => (
                <article className="card card-hover flex flex-col overflow-hidden" key={event.slug}>
                  <div className="card-media relative h-36 bg-[var(--foreground)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="h-full w-full object-cover opacity-80"
                      src="/images/mountain-run-hero.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/65">
                        {event.banner}
                      </p>
                      <p className="mt-1 text-sm font-medium">{event.reward}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="badge">{event.date}</span>
                      <span className="text-sm font-medium tracking-tight">{event.price}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight sm:mt-6 sm:text-xl">
                      {event.name}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">{event.distance}</p>
                    <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)] sm:mt-4">
                      {event.highlight}
                    </p>
                    <Link
                      className="btn btn-primary mt-5 w-full sm:mt-6"
                      href={`/events/${event.slug}`}
                    >
                      View event
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="eyebrow">What you receive</p>
                <h2 className="heading mt-3 sm:mt-4">Rewards that make the finish feel real</h2>
                <p className="lede mt-4">
                  Every verified runner gets a digital finish record, with physical rewards
                  available based on the selected event kit.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {rewards.map(([title, text]) => (
                  <div className="card card-hover p-5" key={title}>
                    <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section border-y border-[var(--line)] bg-white/70">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Gallery</p>
                <h2 className="heading mt-3 sm:mt-4">Finish-line stories</h2>
              </div>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/gallery">
                Open gallery
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {galleryMoments.map((moment) => (
                <article
                  className="card card-hover overflow-hidden"
                  key={moment.title}
                >
                  <div className="card-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-44 w-full object-cover" src={moment.image} />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold tracking-tight">{moment.title}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">{moment.meta}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
              <div className="max-w-xl">
                <p className="eyebrow">Runner reviews</p>
                <h2 className="heading mt-3 sm:mt-4">From the community</h2>
              </div>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/about">
                About Mountain Run
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <figure className="card card-hover p-5 sm:p-6" key={review.name}>
                  <blockquote className="text-sm leading-6 text-[var(--muted)]">
                    &quot;{review.text}&quot;
                  </blockquote>
                  <figcaption className="mt-5">
                    <p className="text-sm font-semibold tracking-tight">{review.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted-soft)]">{review.run}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
      <FloatCta />
    </div>
  );
}
