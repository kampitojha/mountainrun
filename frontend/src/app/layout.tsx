import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkUserSync } from "../components/clerk-user-sync";
import { ThemeProvider } from "./components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mountain Run",
  description:
    "Minimal virtual running events with UPI registration, GPS proof, leaderboards, certificates, and medals.",
  icons: {
    icon: "/favicon.svg",
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
