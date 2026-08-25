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
    default: "Virtual Running Events India 2026 | Real Medals, GPS Marathons & 5K 10K Races — Mountain Run",
    template: "%s | Mountain Run",
  },
  description:
    "India's premier GPS-verified virtual running platform. Register with UPI, run anywhere with Strava, Nike, or Garmin, earn heavy metal finisher medals, DRI-FIT t-shirts, and instant verified E-certificates. Compete in 1.5K, 3K, 5K, 10K, and 21K half marathon challenges across India.",
  keywords: [
    "virtual running events",
    "virtual running events india",
    "virtual marathon india",
    "running events india 2026",
    "online marathon registration india",
    "virtual 5k run",
    "virtual 10k race",
    "half marathon virtual india",
    "21k marathon virtual",
    "running event with medal",
    "finisher medals india",
    "strava virtual marathon",
    "garmin running events india",
    "nike run club virtual race",
    "virtual cycling challenge india",
    "running certificates with qr code",
    "fitness challenge india",
    "marathon athlete medals",
    "upcoming marathons in india 2026",
    "best virtual marathons",
    "virtual run delhi mumbai bangalore",
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
    title: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — Mountain Run",
    description:
      "Join India's premier virtual running events and marathons. Run anywhere with Strava/Garmin, earn authentic heavy metal finisher medals, custom t-shirts, and verified digital certificates.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mountain Run - Virtual Running Events India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — Mountain Run",
    description:
      "Join India's premier virtual running events and marathons. Run anywhere with Strava/Garmin, earn authentic heavy metal finisher medals and verified digital certificates.",
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
