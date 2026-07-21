export type DefaultEvent = {
  title: string;
  slug: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  proofClosesAt: Date;
  distances: string[];
  priceInPaise: number;
  status: "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED" | "CANCELLED";
  city: string;
  medalIncluded?: boolean;
  benefits?: string[];
};

export const defaultEvents: DefaultEvent[] = [
  {
    title: "Monsoon Mountain Miles",
    slug: "monsoon-mountain-miles",
    description:
      "A premium virtual running challenge with GPS proof verification, e-certificate, leaderboard placement, and medal delivery.",
    startsAt: new Date("2026-07-11T00:00:00.000Z"),
    endsAt: new Date("2026-07-17T23:59:59.000Z"),
    proofClosesAt: new Date("2026-07-18T23:59:59.000Z"),
    distances: ["3 km", "5 km", "10 km", "21 km"],
    priceInPaise: 49900,
    status: "OPEN",
    city: "Virtual",
  },
  {
    title: "Independence Endurance Run",
    slug: "independence-endurance-run",
    description:
      "A pan-India endurance event built for verified finish times, fair ranking, and medal delivery tracking.",
    startsAt: new Date("2026-08-10T00:00:00.000Z"),
    endsAt: new Date("2026-08-16T23:59:59.000Z"),
    proofClosesAt: new Date("2026-08-17T23:59:59.000Z"),
    distances: ["5 km", "10 km", "25 km"],
    priceInPaise: 64900,
    status: "OPEN",
    city: "Virtual",
  },
  {
    title: "Himalayan Winter Sprint",
    slug: "himalayan-winter-sprint",
    description:
      "A fast winter sprint challenge with elegant certificates, QR verification, and community leaderboard.",
    startsAt: new Date("2026-12-05T00:00:00.000Z"),
    endsAt: new Date("2026-12-09T23:59:59.000Z"),
    proofClosesAt: new Date("2026-12-10T23:59:59.000Z"),
    distances: ["2 km", "5 km", "10 km"],
    priceInPaise: 39900,
    status: "OPEN",
    city: "Virtual",
  },
  {
    title: "Spring Valley Dash",
    slug: "spring-valley-dash",
    description:
      "A spring season virtual dash with city-wide participation, GPS proof checks, and finisher medals shipped nationwide.",
    startsAt: new Date("2026-03-14T00:00:00.000Z"),
    endsAt: new Date("2026-03-20T23:59:59.000Z"),
    proofClosesAt: new Date("2026-03-21T23:59:59.000Z"),
    distances: ["3 km", "5 km", "10 km"],
    priceInPaise: 44900,
    status: "COMPLETED",
    city: "Virtual",
  },
  {
    title: "Holi Color Virtual Run",
    slug: "holi-color-virtual-run",
    description:
      "A festive family-friendly virtual run celebrating Holi with digital kits, fun finish photos, and verified 2 km and 5 km results.",
    startsAt: new Date("2026-03-05T00:00:00.000Z"),
    endsAt: new Date("2026-03-09T23:59:59.000Z"),
    proofClosesAt: new Date("2026-03-10T23:59:59.000Z"),
    distances: ["2 km", "5 km"],
    priceInPaise: 34900,
    status: "COMPLETED",
    city: "Virtual",
  },
  {
    title: "New Year Night Miles",
    slug: "new-year-night-miles",
    description:
      "A year-end virtual challenge for runners chasing a strong close to the season with verified times and premium finisher medals.",
    startsAt: new Date("2025-12-28T00:00:00.000Z"),
    endsAt: new Date("2026-01-02T23:59:59.000Z"),
    proofClosesAt: new Date("2026-01-03T23:59:59.000Z"),
    distances: ["5 km", "10 km", "21 km"],
    priceInPaise: 54900,
    status: "COMPLETED",
    city: "Virtual",
  },
];
