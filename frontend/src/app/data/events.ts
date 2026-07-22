export const eventBenefits = [
  "Verified race entry",
  "GPS proof verification",
  "Public leaderboard ranking",
  "QR-linked e-certificate",
  "Finisher medal delivery",
  "Event merch and T-shirt options",
  "Email and WhatsApp updates",
];

export type PublicEvent = {
  name: string;
  slug: string;
  date: string;
  distance: string;
  price: string;
  description: string;
  highlight: string;
  banner: string;
  reward: string;
  status: "upcoming" | "past";
  couponCode?: string;
  showCouponOnCard?: boolean;
  activityTypes?: string[];
  benefits?: string[];
  /** Past-event recap stats */
  finishers?: number;
  verifiedResults?: number;
  cities?: number;
  resultNote?: string;
};

export const allPublicEvents: PublicEvent[] = [
  {
    name: "Monsoon Mountain Miles",
    slug: "monsoon-mountain-miles",
    date: "11-17 Jul 2026",
    distance: "3 km / 5 km / 10 km / 21 km",
    price: "Rs. 499",
    description:
      "A clean virtual mountain challenge with verified finishes, certificates, leaderboard rank, and medal delivery.",
    highlight: "Ideal for first virtual races and running clubs.",
    banner: "Rain-ready challenge",
    reward: "Medal + certificate",
    status: "upcoming",
  },
  {
    name: "Independence Endurance Run",
    slug: "independence-endurance-run",
    date: "10-16 Aug 2026",
    distance: "5 km / 10 km / 25 km",
    price: "Rs. 649",
    description:
      "A pan-India endurance event with longer distance options, fair ranking, and premium finisher rewards.",
    highlight: "Built for runners chasing a longer verified effort.",
    banner: "Flagship endurance week",
    reward: "Premium medal + T-shirt",
    status: "upcoming",
  },
  {
    name: "Himalayan Winter Sprint",
    slug: "himalayan-winter-sprint",
    date: "5-9 Dec 2026",
    distance: "2 km / 5 km / 10 km",
    price: "Rs. 399",
    description:
      "A short winter sprint for beginners and families who want a simple, polished finish-line experience.",
    highlight: "Quick, beginner-friendly participation.",
    banner: "Fast festive sprint",
    reward: "Digital kit + medal",
    status: "upcoming",
  },
  {
    name: "Spring Valley Dash",
    slug: "spring-valley-dash",
    date: "14-20 Mar 2026",
    distance: "3 km / 5 km / 10 km",
    price: "Rs. 449",
    description:
      "A spring season virtual dash with city-wide participation, GPS proof checks, and finisher medals shipped nationwide.",
    highlight: "Completed · Strong beginner turnout across 40+ cities.",
    banner: "Season opener",
    reward: "Medal + e-certificate",
    status: "past",
    finishers: 1842,
    verifiedResults: 1620,
    cities: 48,
    resultNote:
      "This event is closed. Browse the recap below or open an upcoming race to register.",
  },
  {
    name: "Holi Color Virtual Run",
    slug: "holi-color-virtual-run",
    date: "5-9 Mar 2026",
    distance: "2 km / 5 km",
    price: "Rs. 349",
    description:
      "A festive family-friendly virtual run celebrating Holi with digital kits, fun finish photos, and verified 2 km and 5 km results.",
    highlight: "Completed · Festival favorite for clubs and first-timers.",
    banner: "Festival run",
    reward: "Digital kit + medal",
    status: "past",
    finishers: 2560,
    verifiedResults: 2314,
    cities: 62,
    resultNote:
      "Registration is closed. View what finishers received, then join the next open event.",
  },
  {
    name: "New Year Night Miles",
    slug: "new-year-night-miles",
    date: "28 Dec 2025 – 2 Jan 2026",
    distance: "5 km / 10 km / 21 km",
    price: "Rs. 549",
    description:
      "A year-end virtual challenge for runners chasing a strong close to the season with verified times and premium finisher medals.",
    highlight: "Completed · Highest 21 km completion rate of the season.",
    banner: "Year-end challenge",
    reward: "Premium medal + certificate",
    status: "past",
    finishers: 1295,
    verifiedResults: 1188,
    cities: 39,
    resultNote:
      "This race has finished. Check the recap stats or head to an open event to register.",
  },
];

/** Open / upcoming races (home, register flows). */
export const publicEvents = allPublicEvents.filter((event) => event.status === "upcoming");

/** Completed races for the events archive section. */
export const pastEvents = allPublicEvents.filter((event) => event.status === "past");

export const upcomingEvents = publicEvents;

export function getEventBySlug(slug: string) {
  return allPublicEvents.find((event) => event.slug === slug);
}

export const galleryMoments = [
  {
    title: "Sunrise finish",
    meta: "5 km finisher",
    image: "/images/sunrise-finish.png",
  },
  {
    title: "Club leaderboard push",
    meta: "10 km team effort",
    image: "/images/club-push.png",
  },
  {
    title: "First medal day",
    meta: "New runner story",
    image: "/images/first-medal.png",
  },
  {
    title: "Weekend long run",
    meta: "21 km verified",
    image: "/images/weekend-long-run.png",
  },
];
