import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

export const metadata: Metadata = {
  title: "Track Finisher Medals & Race Prizes | Mountain Run India",
  description:
    "Track your Mountain Run virtual marathon finisher medal delivery, verified digital certificate, and race goodies status using your bib number.",
  keywords: [
    "track virtual run medal",
    "marathon medal delivery status",
    "running race rewards tracking",
    "virtual run prize status",
    "finisher medal delivery india",
  ],
  openGraph: {
    title: "Track Finisher Medals & Race Prizes | Mountain Run India",
    description:
      "Track your Mountain Run virtual marathon finisher medal delivery and verified digital certificate status.",
    url: "/prize",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/prize`,
  },
};

export default function PrizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
