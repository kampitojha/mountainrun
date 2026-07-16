import Link from "next/link";
import { AppFooter } from "./components/app-footer";
import { AppHeader } from "./components/app-header";
import { galleryMoments, publicEvents } from "./data/events";
import { HomeCtas } from "./components/home-ctas";

const steps = [
  {
    step: "01",
    title: "Choose your run",
    text: "Pick an event, distance, and reward kit before you register.",
  },
  {
    step: "02",
    title: "Run & upload proof",
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
  ["Merch & T-shirt", "Optional event merchandise for premium race kits."],
  ["Leaderboard rank", "Public result listing for verified submissions."],
];

const reviews = [
  {
    name: "Aarav Sharma",
    run: "10K finisher",
    text: "Registration was simple and the proof upload was clear. Getting my certificate the same week felt great.",
  },
  {
    name: "Nisha Verma",
    run: "5K beginner",
    text: "I liked that I could run in my own city but still feel part of an event. The medal made it memorable.",
  },
  {
    name: "Rohan Mehta",
    run: "21K finisher",
    text: "The leaderboard gave my long run a real target. Clean experience from payment to verification.",
  },
];

export default function Home() {
  const previewEvents = publicEvents.slice(0, 3);

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-1">
        <section className="border-b border-[var(--line)]">
          <div className="container-page fade-up py-14 sm:py-20 md:py-28 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Virtual running events</p>
              <h1 className="display mt-4 sm:mt-6">
                Run anywhere.
                <br />
                Finish with proof.
              </h1>
              <p className="lede mx-auto mt-4 max-w-xl px-1 sm:mt-6">
                Clean virtual races with GPS verification, leaderboards, certificates,
                medals, and event merch for runners across India.
              </p>
              <HomeCtas />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            <div className="max-w-xl">
              <p className="eyebrow">How it works</p>
              <h2 className="heading mt-3 sm:mt-4">Three simple steps</h2>
            </div>
            <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3">
              {steps.map((item) => (
                <div className="card p-5 sm:p-6" key={item.step}>
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

        <section className="section border-y border-[var(--line)] bg-white">
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
                  <div className="bg-[var(--foreground)] px-5 py-4 text-white sm:px-6">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                      {event.banner}
                    </p>
                    <p className="mt-2 text-sm font-medium">{event.reward}</p>
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
                    <Link className="btn btn-primary mt-5 w-full sm:mt-6" href={`/events/${event.slug}`}>
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
                  <div className="card p-5" key={title}>
                    <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section border-y border-[var(--line)] bg-white">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Moments of glory</p>
                <h2 className="heading mt-3 sm:mt-4">Finish-line stories</h2>
              </div>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/gallery">
                Open gallery
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {galleryMoments.map((moment) => (
                <article className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white" key={moment.title}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="h-44 w-full object-cover" src={moment.image} />
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
                <h2 className="heading mt-3 sm:mt-4">Experiences from the community</h2>
              </div>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/about">
                About Mountain Run
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <figure className="card p-5 sm:p-6" key={review.name}>
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
    </div>
  );
}
