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
  note: string;
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

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    title: "Ridge line finish",
    event: "Monsoon Mountain Miles",
    location: "Lonavala",
    date: "Jul 2026",
    photographer: "Aarav Mehta",
    category: "Trail Run",
    note: "Verified 10 km finish under monsoon cloud cover.",
    featured: true,
  },
  {
    id: "g2",
    title: "First light warmup",
    event: "Himalayan Winter Sprint",
    location: "Manali",
    date: "Dec 2026",
    photographer: "Nisha Verma",
    category: "Training",
    note: "Pre-race strides with the local club pack.",
  },
  {
    id: "g3",
    title: "Club pack at km 8",
    event: "Independence Endurance Run",
    location: "Pune",
    date: "Aug 2026",
    photographer: "Rohan Kapoor",
    category: "Community",
    note: "Eight runners holding the same pace target.",
    featured: true,
  },
  {
    id: "g4",
    title: "Medal unboxing night",
    event: "Spring Valley Dash",
    location: "Mumbai",
    date: "Mar 2026",
    photographer: "Isha Jain",
    category: "Awards",
    note: "First finisher medals landed after proof approval.",
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
    note: "Quiet 21 km effort above the valley fog.",
  },
  {
    id: "g6",
    title: "Half marathon split board",
    event: "Independence Endurance Run",
    location: "Bengaluru",
    date: "Aug 2026",
    photographer: "Meera Joshi",
    category: "Marathon",
    note: "Even splits posted after verification.",
  },
  {
    id: "g7",
    title: "Kids 2 km celebration",
    event: "Holi Color Virtual Run",
    location: "Ahmedabad",
    date: "Mar 2026",
    photographer: "Kabir Sethi",
    category: "Community",
    note: "Families finishing together on the short course.",
  },
  {
    id: "g8",
    title: "Trail dust and pine",
    event: "Monsoon Mountain Miles",
    location: "Mahabaleshwar",
    date: "Jul 2026",
    photographer: "Ananya Iyer",
    category: "Trail Run",
    note: "Single-track section before the final climb.",
  },
  {
    id: "g9",
    title: "Certificate wall",
    event: "Spring Valley Dash",
    location: "Delhi NCR",
    date: "Mar 2026",
    photographer: "Vikram Shah",
    category: "Awards",
    note: "QR certificates shared after review closed.",
  },
];

export const galleryStats = [
  { label: "Moments logged", value: 1280 },
  { label: "Events covered", value: 24 },
  { label: "Cities", value: 62 },
  { label: "Verified finishes", value: 5400 },
];
