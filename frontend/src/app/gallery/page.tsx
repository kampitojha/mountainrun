import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { GalleryClient } from "./gallery-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Finisher Medals Showcase & Race Gallery | Mountain Run India",
  description:
    "Browse authentic 3D finisher medals, verified runner moments, and race photo stories from Mountain Run virtual marathons, 5K, 10K, and 21K half marathon challenges across India.",
  keywords: [
    "finisher medals showcase",
    "marathon medals india",
    "running gallery india",
    "virtual run race photos",
    "marathon athlete finisher moments",
    "running achievements india",
  ],
  openGraph: {
    title: "Finisher Gallery & Race Moments | Mountain Run India",
    description:
      "View race photos, finisher moments, and achievements from Mountain Run virtual events.",
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
