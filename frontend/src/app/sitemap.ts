import { MetadataRoute } from 'next';
import { allPublicEvents } from './data/events';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mountainrun.in';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mountainrun.in';

interface EventData {
  id?: string;
  slug: string;
  updatedAt?: string;
}

async function getEvents(): Promise<EventData[]> {
  try {
    const response = await fetch(`${API_URL}/api/events`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/prize`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/policies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/refund`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Fetch dynamic event pages and merge with static event catalogue to guarantee 100% coverage
  const apiEvents = await getEvents();
  const eventSlugSet = new Set<string>();

  const eventPages: MetadataRoute.Sitemap = [];

  // Add API events first
  for (const event of apiEvents) {
    if (event.slug && !eventSlugSet.has(event.slug)) {
      eventSlugSet.add(event.slug);
      eventPages.push({
        url: `${SITE_URL}/events/${event.slug}`,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  }

  // Ensure all catalogue events are included
  for (const event of allPublicEvents) {
    if (event.slug && !eventSlugSet.has(event.slug)) {
      eventSlugSet.add(event.slug);
      eventPages.push({
        url: `${SITE_URL}/events/${event.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  }

  return [...staticPages, ...eventPages];
}
