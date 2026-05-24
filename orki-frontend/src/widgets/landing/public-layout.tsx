import type { ReactNode } from "react";

import { LandingNav } from "./landing-nav";
import { Footer } from "./footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <LandingNav />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
