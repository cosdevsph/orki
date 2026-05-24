import type { Metadata } from "next";

import { StudyProgress } from "@/widgets/landing/StudyProgress";

export const metadata: Metadata = {
  title: "Study Progress",
  description:
    "Milestone tracking, daily streaks, and achievement badges that keep your motivation burning through every chapter.",
};

export default function StudyProgressPage() {
  return <StudyProgress />;
}
