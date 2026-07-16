import { PageHeader, PageShell } from "../components/app-shell";
import { galleryMoments } from "../data/events";

const highlights = [
  "Verified GPS finish screenshots",
  "Medal delivery moments",
  "Running club group efforts",
  "First-time finisher stories",
];

export default function GalleryPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="container-page">
          <PageHeader
            eyebrow="Gallery"
            title="Moments from Mountain Run"
            description="A look at runner finishes, medals, club challenges, and the small wins that make every virtual race feel shared."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {galleryMoments.map((moment) => (
              <article
                className="card card-hover overflow-hidden"
                key={moment.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="h-56 w-full object-cover" src={moment.image} />
                <div className="p-5">
                  <h2 className="text-base font-semibold tracking-tight">{moment.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{moment.meta}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 sm:p-6">
            <p className="eyebrow">What gets featured</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => (
                <div className="rounded-lg bg-[var(--panel-soft)] px-4 py-3 text-sm font-medium" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
