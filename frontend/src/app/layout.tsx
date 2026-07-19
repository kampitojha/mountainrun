import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkUserSync } from "../components/clerk-user-sync";
import { ThemeProvider } from "./components/theme-provider";
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
    default: "Mountain Run - Virtual Running Events with GPS Verification",
    template: "%s | Mountain Run",
  },
  description:
    "Join India's premier virtual running events. Register with UPI, track with GPS, earn medals & certificates. Compete in marathons, 5K, 10K runs from anywhere.",
  keywords: [
    "virtual running",
    "online marathon",
    "GPS run tracking",
    "running events India",
    "virtual marathon",
    "5K run",
    "10K run",
    "half marathon",
    "UPI registration",
    "running medals",
    "running certificates",
    "fitness challenge",
    "virtual race",
  ],
  authors: [{ name: "Mountain Run" }],
  creator: "Mountain Run",
  publisher: "Mountain Run",
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
    locale: "en_US",
    alternateLocale: ["en_IN"],
    url: SITE_URL,
    siteName: "Mountain Run",
    title: "Mountain Run - Virtual Running Events with GPS Verification",
    description:
      "Join India's premier virtual running events. Register with UPI, track with GPS, earn medals & certificates.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mountain Run - Virtual Running Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mountain Run - Virtual Running Events with GPS Verification",
    description:
      "Join India's premier virtual running events. Register with UPI, track with GPS, earn medals & certificates.",
    images: ["/og-image.png"],
    creator: "@mountainrun",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

/** Blocks FOUC for public site theme only (admin uses its own storage key). */
const siteThemeInitScript = `
(function(){
  try {
    var k = 'mr-site-theme';
    var t = localStorage.getItem(k);
    if (t !== 'light' && t !== 'dark') t = 'light';
    var r = document.documentElement;
    r.dataset.theme = t;
    if (t === 'dark') r.classList.add('dark');
    else r.classList.remove('dark');
    r.style.colorScheme = t;
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteThemeInitScript }} />
        <StructuredData />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <ClerkProvider
            publishableKey={publishableKey || undefined}
            appearance={{
              variables: {
                colorPrimary: "#0a0a0a",
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
          </ClerkProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
