export type GalleryCategory =
  | "All"
  | "Trail Run"
  | "Marathon"
  | "Training"
  | "Community"
  | "Nature"
  | "Awards";

export type GalleryItem = {
  id: string;
  title: string;
  event: string;
  location: string;
  date: string;
  photographer: string;
  category: Exclude<GalleryCategory, "All">;
  image: string;
  objectPosition: string;
  tall?: boolean;
  featured?: boolean;
};

export const galleryCategories: GalleryCategory[] = [
  "All",
  "Trail Run",
  "Marathon",
  "Training",
  "Community",
  "Nature",
  "Awards",
];

/** One hero asset, varied crops/positions for a richer grid until more photos ship. */
const img = "/images/mountain-run-hero.png";

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    title: "Ridge line finish",
    event: "Monsoon Mountain Miles",
    location: "Lonavala ridge",
    date: "Jul 2026",
    photographer: "Aarav Mehta",
    category: "Trail Run",
    image: img,
    objectPosition: "50% 28%",
    tall: true,
    featured: true,
  },
  {
    id: "g2",
    title: "First light warmup",
    event: "Himalayan Winter Sprint",
    location: "Manali foothills",
    date: "Dec 2026",
    photographer: "Nisha Verma",
    category: "Training",
    image: img,
    objectPosition: "70% 40%",
  },
  {
    id: "g3",
    title: "Club pack at km 8",
    event: "Independence Endurance Run",
    location: "Pune clubs",
    date: "Aug 2026",
    photographer: "Rohan Kapoor",
    category: "Community",
    image: img,
    objectPosition: "30% 60%",
    tall: true,
  },
  {
    id: "g4",
    title: "Medal unboxing night",
    event: "Spring Valley Dash",
    location: "Mumbai",
    date: "Mar 2026",
    photographer: "Isha Jain",
    category: "Awards",
    image: img,
    objectPosition: "50% 70%",
    featured: true,
  },
  {
    id: "g5",
    title: "Cloud line long run",
    event: "New Year Night Miles",
    location: "Nilgiris",
    date: "Jan 2026",
    photographer: "Dev Malhotra",
    category: "Nature",
    image: img,
    objectPosition: "20% 35%",
  },
  {
    id: "g6",
    title: "21 km split board",
    event: "Independence Endurance Run",
    location: "Bengaluru",
    date: "Aug 2026",
    photographer: "Meera Joshi",
    category: "Marathon",
    image: img,
    objectPosition: "80% 55%",
    tall: true,
  },
  {
    id: "g7",
    title: "Kids 2 km celebration",
    event: "Holi Color Virtual Run",
    location: "Ahmedabad",
    date: "Mar 2026",
    photographer: "Kabir Sethi",
    category: "Community",
    image: img,
    objectPosition: "45% 20%",
  },
  {
    id: "g8",
    title: "Trail dust and pine",
    event: "Monsoon Mountain Miles",
    location: "Mahabaleshwar",
    date: "Jul 2026",
    photographer: "Ananya Iyer",
    category: "Trail Run",
    image: img,
    objectPosition: "60% 75%",
  },
  {
    id: "g9",
    title: "Certificate wall",
    event: "Spring Valley Dash",
    location: "Delhi NCR",
    date: "Mar 2026",
    photographer: "Vikram Shah",
    category: "Awards",
    image: img,
    objectPosition: "40% 50%",
    featured: true,
  },
  {
    id: "g10",
    title: "Tempo loops at dusk",
    event: "City Training Series",
    location: "Hyderabad",
    date: "Feb 2026",
    photographer: "Sara Khan",
    category: "Training",
    image: img,
    objectPosition: "15% 45%",
    tall: true,
  },
  {
    id: "g11",
    title: "Fog valley climb",
    event: "Himalayan Winter Sprint",
    location: "Shimla belt",
    date: "Dec 2026",
    photographer: "Arjun Nair",
    category: "Nature",
    image: img,
    objectPosition: "55% 15%",
  },
  {
    id: "g12",
    title: "Half marathon cadence",
    event: "Independence Endurance Run",
    location: "Chennai coast",
    date: "Aug 2026",
    photographer: "Priya Rao",
    category: "Marathon",
    image: img,
    objectPosition: "35% 65%",
  },
];

export const galleryStats = [
  { label: "Photos", value: 1280 },
  { label: "Events covered", value: 24 },
  { label: "Participants", value: 5400 },
  { label: "Memories shared", value: 9100 },
];
