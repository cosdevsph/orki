import type { Metadata } from "next";

import { MockExams } from "@/widgets/landing/MockExams";

export const metadata: Metadata = {
  title: "Mock Exams",
  description:
    "Practice under real exam conditions with timed, adaptive mock tests that mirror actual board exam structure.",
};

export default function MockExamsPage() {
  return <MockExams />;
}
