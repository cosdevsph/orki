import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/providers/auth-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { OnboardingProvider } from "@/providers/onboarding-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider, ThemeScript } from "@/providers/theme-provider";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://orki.cosedevs.com"),
  title: {
    default: "Orki \u2026 Your Smart Exam Companion",
    template: "%s | Orki",
  },
  description: "AI-powered exam reviewer for LEPT, CSE, PmLE, CLE",
  keywords: [
    "exam reviewer",
    "LEPT",
    "CSE",
    "PmLE",
    "CLE",
    "board exam",
    "AI study companion",
    "Orki",
  ],
  authors: [{ name: "Orki Team" }],
  creator: "Orki",
  icons: {
    icon: [
      { url: "/Logo/OrkiLogo.svg", type: "image/svg+xml" },
      { url: "/Logo/OrkiLogo.webp", type: "image/webp" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32" },
    ],
    shortcut: "/Logo/OrkiLogo.svg",
    apple: "/Logo/OrkiLogo.webp",
  },
  openGraph: {
    title: "Orki \u2026 Your Smart Exam Companion",
    description: "AI-powered exam reviewer for LEPT, CSE, PmLE, CLE",
    url: "https://orki.cosedevs.com",
    siteName: "Orki",
    images: [
      {
        url: "/thumbnail/orki-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Orki \u2013 Exam Reviewer",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orki \u2026 Your Smart Exam Companion",
    description: "AI-powered exam reviewer for LEPT, CSE, PmLE, CLE",
    creator: "@orki",
    site: "@orki",
    images: ["/thumbnail/orki-thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <NotificationProvider>
                <OnboardingProvider>{children}</OnboardingProvider>
              </NotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
