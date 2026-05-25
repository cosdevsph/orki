import { create } from "zustand";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/shared/firebase/client";

export type MarketSentiment = "STRONG_BULLISH" | "BULLISH" | "BEARISH";

export type DailyScorePoint = {
  date: string; // "MM/DD"
  fullDate: string; // "YYYY-MM-DD" for grouping
  score: number; // Daily average percentage
  examCount: number;
};

interface AnalyticsStore {
  // State
  examHistory: DailyScorePoint[];
  marketSentiment: MarketSentiment;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchScoreTrend: (userId: string, examType: string) => Promise<void>;
  calculateSentiment: (trend: DailyScorePoint[]) => MarketSentiment;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  examHistory: [],
  marketSentiment: "BULLISH",
  isLoading: false,
  error: null,

  calculateSentiment: (trend: DailyScorePoint[]) => {
    if (trend.length < 2) return "BULLISH";

    const midpoint = Math.floor(trend.length / 2);
    const olderHalf = trend.slice(0, midpoint);
    const newerHalf = trend.slice(midpoint);

    // Calculate averages
    const olderAvg =
      olderHalf.reduce((sum, p) => sum + p.score, 0) / olderHalf.length;
    const newerAvg =
      newerHalf.reduce((sum, p) => sum + p.score, 0) / newerHalf.length;

    const velocity = newerAvg - olderAvg;

    // Check last 2 consecutive days for drops (bearish signal)
    if (trend.length >= 2) {
      const last2 = trend.slice(-2);
      if (last2[0].score > 0 && last2[1].score > 0) {
        const recentDrop = last2[1].score - last2[0].score;
        if (recentDrop < -5) {
          return "BEARISH";
        }
      }
    }

    // Sentiment determination
    if (velocity > 0 && newerAvg >= 75) {
      return "STRONG_BULLISH";
    } else if (velocity > 0) {
      return "BULLISH";
    } else if (velocity < 0 || newerAvg < 70) {
      return "BEARISH";
    }

    return "BULLISH";
  },

  fetchScoreTrend: async (userId: string, examType: string) => {
    set({ isLoading: true, error: null });
    try {
      // Query exam_attempts collection (root level) filtered by user_id and exam_type, ordered by completed_at desc, limited to 20
      const q = query(
        collection(db, "exam_attempts"),
        where("user_id", "==", userId),
        where("exam_type", "==", examType),
        orderBy("completed_at", "desc"),
        limit(20)
      );

      const snap = await getDocs(q);
      const attempts = snap.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          exam_type: data.exam_type,
          subject: data.subject,
          score: data.score ?? 0,
          completed_at: data.completed_at instanceof Timestamp ? data.completed_at.toDate() : new Date(),
        };
      });

      // Group by calendar date and calculate daily average
      const dailyMap: Record<string, { scores: number[]; count: number }> = {};

      for (const attempt of attempts) {
        const dateStr = attempt.completed_at.toISOString().split("T")[0];
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = { scores: [], count: 0 };
        }
        dailyMap[dateStr].scores.push(attempt.score);
        dailyMap[dateStr].count += 1;
      }

      // Convert to DailyScorePoint and sort chronologically
      const dailyTrend: DailyScorePoint[] = Object.entries(dailyMap)
        .map(([fullDate, data]) => {
          const avg = Math.round(
            data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
          );
          const [year, month, day] = fullDate.split("-");
          return {
            date: `${month}/${day}`,
            fullDate,
            score: avg,
            examCount: data.count,
          };
        })
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

      // Keep only last 7 active days
      const last7 = dailyTrend.slice(-7);

      // Calculate sentiment
      set({
        examHistory: last7,
        marketSentiment: useAnalyticsStore
          .getState()
          .calculateSentiment(last7),
        isLoading: false,
      });
    } catch (err) {
      console.error("[AnalyticsStore] fetchScoreTrend failed:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to fetch trend",
        isLoading: false,
      });
    }
  },
}));
