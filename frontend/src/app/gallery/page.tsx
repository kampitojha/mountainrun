import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { GalleryClient } from "./gallery-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Running Gallery - Race Photos & Moments | Mountain Run",
  description:
    "View race photos, finisher moments, and achievements from Mountain Run virtual events. See runners from across India completing their goals.",
  keywords: [
    "running gallery",
    "race photos",
    "virtual run photos",
    "marathon gallery",
    "running moments",
    "finisher photos",
  ],
  openGraph: {
    title: "Running Gallery - Race Photos & Moments",
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
