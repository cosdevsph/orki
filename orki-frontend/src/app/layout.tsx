import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/providers/auth-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { OnboardingProvider } from "@/providers/onboarding-provider";
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
  title: "Orki",
  description: "Study smarter for board exam success.",
  icons: {
    icon: [
      { url: "/Logo/OrkiLogo.svg", type: "image/svg+xml" },
      { url: "/Logo/OrkiLogo.webp", type: "image/webp" },
    ],
    shortcut: "/Logo/OrkiLogo.svg",
    apple: "/Logo/OrkiLogo.webp",
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
          <AuthProvider>
            <NotificationProvider>
              <OnboardingProvider>{children}</OnboardingProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
