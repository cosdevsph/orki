import type { DashboardSummary } from "@/entities/dashboard/types";
import { DailyProgressWidget } from "@/widgets/dashboard/daily-progress-widget";
import { QuickActions } from "@/widgets/dashboard/quick-actions";
import { ResumeCard } from "@/widgets/dashboard/resume-card";
import { StatsRow } from "@/widgets/dashboard/stats-row";
import { UpcomingExamsWidget } from "@/widgets/dashboard/upcoming-exams-widget";
import { WelcomeHeader } from "@/widgets/dashboard/welcome-header";

// Mock data — replace with API call once backend is wired
const MOCK_STATS: DashboardSummary = {
  activeStreakDays: 12,
  dueFlashcards: 24,
  upcomingExams: 3,
  weeklyStudyHours: 12,
};

export default function DashboardPage() {
  return (
    <div className="animate-page-in space-y-8">
      <WelcomeHeader />
      <StatsRow stats={MOCK_STATS} />
      <ResumeCard />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-6">
          <UpcomingExamsWidget />
        </div>
        <div className="col-span-2 space-y-6">
          <DailyProgressWidget />
        </div>
      </div>
      <QuickActions />
    </div>
  );
}

