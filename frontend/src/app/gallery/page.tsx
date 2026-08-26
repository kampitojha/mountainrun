 import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { GalleryClient } from "./gallery-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Finisher Medals Showcase & Race Gallery 2026 | Mountain Run India",
  description:
    "Browse authentic 3D finisher medals, DRI-FIT t-shirts, verified runner moments, and race photo stories from Mountain Run virtual marathons, 5K, 10K, and 21K half marathon challenges across India.",
  keywords: [
    "virtual run with medal",
    "virtual run medal India",
    "virtual marathon medal",
    "virtual run medal",
    "online marathon with medal",
    "virtual race with medal",
    "virtual running medal",
    "finisher medal virtual run",
    "virtual run medal and certificate",
    "running medal India",
    "marathon medal India",
    "finisher medal India",
    "5K medal India",
    "10K medal India",
    "21K medal India",
    "running t shirt",
    "marathon kit India",
    "virtual run merchandise",
    "finisher medals showcase",
    "virtual run race photos",
  ],
  openGraph: {
    title: "Finisher Medals Showcase & Race Gallery 2026 | Mountain Run India",
    description:
      "View heavy metal finisher medals, race photos, and runner moments from Mountain Run virtual events across India.",
    url: "/gallery",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/gallery`,
  },
};

export default function GalleryPage() {
  return (
    <PageShell>
      <section className="page-section">
        <div className="container-page">
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Gallery", href: "/gallery" },
            ]}
          />
          <GalleryClient />
        </div>
      </section>
    </PageShell>
  );
}
