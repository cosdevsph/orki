import type { Metadata } from "next";

import { DashboardTracking } from "@/widgets/landing/DashboardTracking";

export const metadata: Metadata = {
  title: "Dashboard Tracking",
  description:
    "See your full study picture at a glance. Visualize daily progress, manage your schedule, and stay relentlessly on track with Orki.",
};

export default function DashboardTrackingPage() {
  return <DashboardTracking />;
}
