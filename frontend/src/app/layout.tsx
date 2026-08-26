import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkUserSync } from "../components/clerk-user-sync";
import { ThemeProvider } from "./components/theme-provider";
import { FloatingContact } from "./components/floating-contact";
import { Analytics } from "@vercel/analytics/next";
import { StructuredData } from "./components/structured-data";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Virtual Running Events India 2026 | Virtual Marathon, 5K, 10K & Real Medals — Mountain Run",
    template: "%s | Mountain Run",
  },
  description:
    "India's premier GPS-verified virtual running platform. Register for online marathons, 5K, 10K & 21K Half Marathon challenges. Run anywhere with Strava, Nike Run Club, or Garmin, and earn authentic heavy metal finisher medals, DRI-FIT t-shirts, and instant QR-verified E-certificates delivered with free shipping across India.",
  keywords: [
    "virtual run",
    "virtual run India",
    "virtual marathon",
    "virtual marathon India",
    "online marathon",
    "online marathon India",
    "virtual race India",
    "virtual running event",
    "virtual running events India",
    "virtual running events 2026",
    "online running event",
    "virtual race",
    "virtual running race",
    "virtual fitness challenge",
    "virtual fitness challenge India",
    "online running challenge",
    "virtual running challenge",
    "running challenge India",
    "online sports event India",
    "5K virtual run",
    "5K virtual run with medal",
    "10K virtual run",
    "10K virtual run with medal",
    "21K virtual run",
    "21K virtual run with medal",
    "half marathon virtual run",
    "virtual half marathon",
    "virtual ultra marathon",
    "virtual 5K",
    "virtual 10K",
    "virtual 21K",
    "online 5K run",
    "online 10K run",
    "online half marathon",
    "5K virtual marathon",
    "10K virtual marathon",
    "21K virtual marathon",
    "virtual run with medal",
    "virtual run medal India",
    "virtual marathon medal",
    "virtual run medal",
    "online marathon with medal",
    "virtual race with medal",
    "finisher medal virtual run",
    "virtual run medal and certificate",
    "virtual marathon medal and certificate",
    "running medal India",
    "marathon medal India",
    "finisher medal India",
    "virtual run with t shirt",
    "virtual run t shirt India",
    "virtual marathon with t shirt",
    "virtual run kit India",
    "marathon kit India",
    "virtual run certificate",
    "virtual marathon certificate",
    "virtual run e certificate",
    "virtual run registration",
    "virtual run registration India",
    "virtual marathon registration",
    "online marathon registration",
    "register for virtual run",
    "register for virtual marathon",
    "upcoming virtual runs",
    "upcoming virtual runs in India",
    "upcoming virtual marathon",
    "virtual run calendar India",
    "best virtual run in India",
    "best virtual marathon in India",
    "virtual run platform India",
    "running events India 2026",
    "running events near me",
    "running competition in India",
    "marathon India 2026",
    "upcoming marathons in India 2026",
    "marathon calendar India 2026",
    "5K run India",
    "10K run India",
    "21K run India",
    "strava virtual marathon",
    "garmin running events india",
    "nike run club virtual race",
    "virtual cycling challenge india",
    "virtual run for beginners",
    "virtual run for kids",
    "virtual run for women",
    "virtual run with free delivery",
    "running events Delhi",
    "running events Mumbai",
    "running events Bangalore",
    "running events Pune",
    "running events Hyderabad",
    "running events Chennai",
    "running events Kolkata",
    "running events Jaipur",
  ],
  authors: [{ name: "Mountain Run" }],
  creator: "Mountain Run",
  publisher: "Mountain Run",
  category: "Sports & Marathon Events",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: "Mountain Run",
    title: "Virtual Running Events India 2026 | Real Medals, GPS Marathons & 5K 10K Races — Mountain Run",
    description:
      "Join India's premier virtual running events and marathons. Run anywhere with Strava/Garmin, earn authentic heavy metal finisher medals, custom t-shirts, and verified digital certificates with free delivery across India.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mountain Run - Virtual Running Events India 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Running Events India 2026 | Real Medals, GPS Marathons & 5K 10K Races — Mountain Run",
    description:
      "Join India's premier virtual running events and marathons. Run anywhere with Strava/Garmin, earn authentic heavy metal finisher medals, DRI-FIT t-shirts, and verified digital certificates.",
    images: ["/og-image.png"],
    creator: "@mountainrun",
  },
  icons: {
    icon: "/logo-mark.svg",
    shortcut: "/logo-mark.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0c",
};

/** Blocks FOUC and permanently enforces dark theme */
const siteThemeInitScript = `
(function(){
  try {
    localStorage.setItem('mr-site-theme', 'dark');
    var r = document.documentElement;
    r.dataset.theme = 'dark';
    r.classList.add('dark');
    r.style.colorScheme = 'dark';
  } catch (e) {}
})();
`;

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external origins to reduce latency */}
        <link rel="preconnect" href="https://clerk.mountainrun.in" />
        <link rel="preconnect" href="https://api.mountainrun.in" />
        <link rel="dns-prefetch" href="https://clerk.mountainrun.in" />
        <link rel="dns-prefetch" href="https://api.mountainrun.in" />
        <script dangerouslySetInnerHTML={{ __html: siteThemeInitScript }} />
        <StructuredData />
      </head>
      <body className="min-h-full flex flex-col bg-(--background) text-(--foreground)">
        <ThemeProvider>
          <ClerkProvider
            publishableKey={publishableKey || undefined}
            appearance={{
              variables: {
                colorPrimary: "#0d9488",
                borderRadius: "0.75rem",
              },
              elements: {
                formButtonPrimary:
                  "bg-[var(--foreground)] hover:bg-[var(--accent-hover)] shadow-none",
                footerActionLink: "text-[var(--foreground)] hover:text-[var(--muted)]",
                socialButtonsBlockButton: "border border-[var(--line)]",
                footer: "hidden",
              },
            }}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignOutUrl="/"
          >
            <ClerkUserSync />
            {children}
            <FloatingContact />
          </ClerkProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
