import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkUserSync } from "../components/clerk-user-sync";
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
  themeColor: "#fafaf9",
};

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
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
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
      </body>
    </html>
  );
}
