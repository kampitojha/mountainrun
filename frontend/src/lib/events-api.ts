import { getApiUrl } from "./api";
import type { PublicEvent } from "../app/data/events";
import { allPublicEvents, getEventBySlug } from "../app/data/events";

export type ApiEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  startsAt: string;
  endsAt: string;
  distances: string[];
  priceInPaise: number;
  paymentRequired?: boolean;
  medalIncluded?: boolean;
  featured?: boolean;
  phase?: "upcoming" | "live" | "past";
  registrationOpen?: boolean;
  city?: string | null;
  couponCode?: string | null;
  showCouponOnCard?: boolean;
  activityTypes?: string[];
  _count?: { registrations: number };
  stats?: {
    registrations?: number;
    verifiedResults?: number;
    finishers?: number;
  };
};

function formatDateRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
  const monthYear = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  if (sameMonth) {
    return `${day.format(start)}-${day.format(end)} ${monthYear.format(end)}`;
  }

  const full = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${full.format(start)} – ${full.format(end)}`;
}

export function mapApiEventToPublic(
  event: ApiEvent,
  forcePhase?: "upcoming" | "past",
): PublicEvent {
  const isPast =
    forcePhase === "past" ||
    event.phase === "past" ||
    event.registrationOpen === false ||
    ["COMPLETED", "CLOSED", "CANCELLED"].includes(event.status);

  const staticMatch = allPublicEvents.find((item) => item.slug === event.slug);
  const apiFinishers = event.stats?.finishers ?? event._count?.registrations;
  const apiVerified = event.stats?.verifiedResults ?? event._count?.registrations;

  return {
    name: event.title,
    slug: event.slug,
    date: formatDateRange(event.startsAt, event.endsAt),
    distance: event.distances.join(" / "),
    price:
      !event.paymentRequired || event.priceInPaise <= 0
        ? "Free"
        : `Rs. ${Math.round(event.priceInPaise / 100)}`,
    description: event.description,
    highlight:
      staticMatch?.highlight ??
      (isPast
        ? "Completed · Tap to view recap and rewards."
        : "Open for registration · Choose distance and join."),
    banner: staticMatch?.banner ?? (isPast ? "Past race" : "Open event"),
    reward: staticMatch?.reward ?? (isPast ? "Medal + certificate" : "Register now"),
    couponCode: event.couponCode ?? undefined,
    showCouponOnCard: event.showCouponOnCard ?? undefined,
    activityTypes: event.activityTypes ?? ["running"],
    status: isPast ? "past" : "upcoming",
    finishers:
      apiFinishers && apiFinishers > 0 ? apiFinishers : staticMatch?.finishers ?? apiFinishers,
    verifiedResults:
      apiVerified && apiVerified > 0
        ? apiVerified
        : staticMatch?.verifiedResults ?? apiVerified,
    cities: staticMatch?.cities,
    resultNote: staticMatch?.resultNote,
  };
}

/** Server or client: fetch one event by slug, fallback to static catalog. */
export async function fetchEventBySlug(slug: string): Promise<PublicEvent | null> {
  try {
    const response = await fetch(getApiUrl(`/api/events/${encodeURIComponent(slug)}`), {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const json = (await response.json()) as { data: ApiEvent };
      if (json.data) {
        return mapApiEventToPublic(json.data);
      }
    }
  } catch {
    // offline / API down
  }

  return getEventBySlug(slug) ?? null;
}

/** Fetch open/upcoming events for home & previews. Featured first when set by admin. */
export async function fetchOpenEvents(options?: {
  homeFeaturedFirst?: boolean;
  limit?: number;
}): Promise<PublicEvent[]> {
  const limit = options?.limit;
  try {
    const response = await fetch(getApiUrl("/api/events?scope=open"), {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const json = (await response.json()) as { data: ApiEvent[] };
      if (Array.isArray(json.data) && json.data.length > 0) {
        let rows = [...json.data];
        if (options?.homeFeaturedFirst) {
          rows.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        }
        if (limit != null) {
          rows = rows.slice(0, limit);
        }
        return rows.map((event) => mapApiEventToPublic(event, "upcoming"));
      }
    }
  } catch {
    // fallback
  }

  const fallback = allPublicEvents.filter((event) => event.status === "upcoming");
  return limit != null ? fallback.slice(0, limit) : fallback;
}

export type HomeMoment = {
  id?: string;
  title: string;
  meta: string;
  image: string;
};

export type HomeTestimonial = {
  id?: string;
  name: string;
  role: string;
  city?: string | null;
  quote: string;
  rating: number;
};

export async function fetchHomeContent(): Promise<{
  moments: HomeMoment[];
  testimonials: HomeTestimonial[];
}> {
  try {
    const response = await fetch(getApiUrl("/api/content/home"), {
      next: { revalidate: 30 },
    });
    if (response.ok) {
      const json = (await response.json()) as {
        data: { moments: HomeMoment[]; testimonials: HomeTestimonial[] };
      };
      return {
        moments: json.data?.moments ?? [],
        testimonials: json.data?.testimonials ?? [],
      };
    }
  } catch {
    // fallback empty → components use static defaults
  }
  return { moments: [], testimonials: [] };
}

export async function fetchGalleryContent(category?: string) {
  try {
    const qs = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    const response = await fetch(getApiUrl(`/api/content/gallery${qs}`), {
      next: { revalidate: 30 },
    });
    if (response.ok) {
      const json = await response.json();
      return (json.data ?? []) as Array<{
        id: string;
        title: string;
        event: string;
        location: string;
        date: string;
        category: string;
        image: string;
        meta?: string | null;
      }>;
    }
  } catch {
    // fallback
  }
  return null;
}
