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
  category: Exclude<GalleryCategory, "All">;
  image: string;
  featured?: boolean;
};

/** Site photography used as the visual template for every gallery card. */
export const galleryImagePool = [
  "/images/sunrise-finish.png",
  "/images/mountain-run-hero.png",
  "/images/first-medal.png",
  "/images/club-push.png",
  "/images/weekend-long-run.png",
] as const;

export const galleryCategories: GalleryCategory[] = [
  "All",
  "Trail Run",
  "Marathon",
  "Training",
  "Community",
  "Nature",
  "Awards",
];

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    title: "Ridge line finish",
    event: "Monsoon Mountain Miles",
    location: "Lonavala",
    date: "Jul 2026",
    category: "Trail Run",
    image: galleryImagePool[0],
    featured: true,
  },
  {
    id: "g2",
    title: "First light warmup",
    event: "Himalayan Winter Sprint",
    location: "Manali",
    date: "Dec 2026",
    category: "Training",
    image: galleryImagePool[1],
  },
  {
    id: "g3",
    title: "Club pack at km 8",
    event: "Independence Endurance Run",
    location: "Pune",
    date: "Aug 2026",
    category: "Community",
    image: galleryImagePool[3],
    featured: true,
  },
  {
    id: "g4",
    title: "Medal unboxing night",
    event: "Spring Valley Dash",
    location: "Mumbai",
    date: "Mar 2026",
    category: "Awards",
    image: galleryImagePool[2],
    featured: true,
  },
  {
    id: "g5",
    title: "Cloud line long run",
    event: "New Year Night Miles",
    location: "Nilgiris",
    date: "Jan 2026",
    category: "Nature",
    image: galleryImagePool[4],
  },
  {
    id: "g6",
    title: "Half marathon split",
    event: "Independence Endurance Run",
    location: "Bengaluru",
    date: "Aug 2026",
    category: "Marathon",
    image: galleryImagePool[0],
  },
  {
    id: "g7",
    title: "Kids 2 km celebration",
    event: "Holi Color Virtual Run",
    location: "Ahmedabad",
    date: "Mar 2026",
    category: "Community",
    image: galleryImagePool[3],
  },
  {
    id: "g8",
    title: "Trail dust and pine",
    event: "Monsoon Mountain Miles",
    location: "Mahabaleshwar",
    date: "Jul 2026",
    category: "Trail Run",
    image: galleryImagePool[1],
  },
  {
    id: "g9",
    title: "Certificate wall",
    event: "Spring Valley Dash",
    location: "Delhi NCR",
    date: "Mar 2026",
    category: "Awards",
    image: galleryImagePool[2],
  },
  {
    id: "g10",
    title: "Sunday long miles",
    event: "Weekend Club Run",
    location: "Hyderabad",
    date: "Jun 2026",
    category: "Training",
    image: galleryImagePool[4],
  },
  {
    id: "g11",
    title: "Valley dawn strides",
    event: "Himalayan Winter Sprint",
    location: "Shimla",
    date: "Dec 2026",
    category: "Nature",
    image: galleryImagePool[0],
  },
  {
    id: "g12",
    title: "Finish line cheer",
    event: "Independence Endurance Run",
    location: "Jaipur",
    date: "Aug 2026",
    category: "Marathon",
    image: galleryImagePool[1],
  },
];

export const galleryStats = [
  { label: "Moments logged", value: 1280 },
  { label: "Events covered", value: 24 },
  { label: "Cities", value: 62 },
  { label: "Verified finishes", value: 5400 },
];
