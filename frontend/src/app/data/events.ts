export const eventBenefits = [
  "Verified race entry",
  "GPS proof verification",
  "Public leaderboard ranking",
  "Real finisher certificate",
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
  bannerImageUrl?: string;
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
  /** ISO date range for countdown / urgency (API-driven events) */
  startsAt?: string;
  endsAt?: string;
  /** Strikethrough "MRP" shown next to the entry fee for open events */
  compareAtPrice?: string;
  /** Live registration count when available from the API */
  registrations?: number;
};

export const allPublicEvents: PublicEvent[] = [
  {
    name: "Sports Day Celebration",
    slug: "sports-day-celebration",
    date: "29 Aug – 3 Sep 2026",
    distance: "1.6 km / 3.2 km / 5 km / 7 km / 10 km / 15 km / 21 km",
    price: "Rs. 399",
    description:
      "Celebrate the spirit of sports, fitness and fun! 🏆 Join the Sports Day Celebration and make every step count. Complete your chosen distance at your own pace.",
    highlight: "Open for registration · Choose distance and join.",
    banner: "Open event",
    bannerImageUrl:
      "https://res.cloudinary.com/yppcqzt6/image/upload/v1787133746/mountainrun/admin/qqrxyzirjkj6yshgkwgg.png",
    reward: "Premium medal + e-certificate",
    status: "upcoming",
    compareAtPrice: "Rs. 799",
    activityTypes: ["running", "cycling", "walking"],
    finishers: 2356,
    verifiedResults: 2245,
    cities: 52,
  },
  {
    name: "Independence Day Virtual Run 2026 🇮🇳",
    slug: "independence-day-virtual-run-2026",
    date: "15-20 Aug 2026",
    distance: "1.5 km / 3 km / 5 km / 10 km / 15 km / 20 km / 25 km / 30 km",
    price: "Rs. 349",
    description:
      "Celebrate India's Independence Day by running from anywhere in the country. Complete your chosen distance at your own pace during the event window. Every finisher receives an official digital certificate, premium finisher medal, exclusive event T-shirt and exciting goodies.",
    highlight: "Completed · Over 400+ verified runners nationwide.",
    banner: "Flagship run",
    bannerImageUrl:
      "https://res.cloudinary.com/yppcqzt6/image/upload/v1785155314/mountainrun/admin/uvujs4wpdunrnmz9rfqt.jpg",
    reward: "Premium medal + T-shirt + certificate",
    status: "past",
    activityTypes: ["running", "cycling", "walking"],
    finishers: 500,
    verifiedResults: 432,
    cities: 25,
    resultNote:
      "Registration is closed. View what finishers received, then join the next open event.",
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
    reward: "Medal + certificate",
    status: "past",
    activityTypes: ["running"],
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
    activityTypes: ["running"],
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
    activityTypes: ["running"],
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
    image: "/images/sunrise-finish.svg",
  },
  {
    title: "Club leaderboard push",
    meta: "10 km team effort",
    image: "/images/club-push.svg",
  },
  {
    title: "First medal day",
    meta: "New runner story",
    image: "/images/first-medal.svg",
  },
  {
    title: "Weekend long run",
    meta: "21 km verified",
    image: "/images/weekend-long-run.svg",
  },
];
