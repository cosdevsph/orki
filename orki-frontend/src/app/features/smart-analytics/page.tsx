import type { Metadata } from "next";

import { SmartAnalytics } from "@/widgets/landing/SmartAnalytics";

export const metadata: Metadata = {
  title: "Smart Analytics",
  description:
    "Understand exactly where you're strong and where to focus. Data-driven insights to optimize every study session with Orki.",
};

export default function SmartAnalyticsPage() {
  return <SmartAnalytics />;
}
