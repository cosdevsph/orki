import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DailyScorePoint, MarketSentiment } from "@/shared/stores/useAnalyticsStore";

interface ScoreTrendChartProps {
  data: DailyScorePoint[];
  sentiment: MarketSentiment;
  isLoading: boolean;
}

const SENTIMENT_CONFIG: Record<
  MarketSentiment,
  { color: string; gradientId: string; icon: string; message: string }
> = {
  STRONG_BULLISH: {
    color: "#10B981",
    gradientId: "gradientBullish",
    icon: "🚀",
    message:
      "Mastery Sentiment: STRONG BULLISH — You are maintaining strong upward momentum. Keep accumulating gains!",
  },
  BULLISH: {
    color: "#10B981",
    gradientId: "gradientBullish",
    icon: "📈",
    message:
      "Mastery Sentiment: BULLISH — You are maintaining positive momentum. Keep up the great work!",
  },
  BEARISH: {
    color: "#EF4444",
    gradientId: "gradientBearish",
    icon: "⚠️",
    message:
      "Mastery Sentiment: BEARISH — Critical correction detected. Hit the flashcards to stop the sell-off!",
  },
};

export function ScoreTrendChart({
  data,
  sentiment,
  isLoading,
}: ScoreTrendChartProps) {
  const config = SENTIMENT_CONFIG[sentiment];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted">Loading trend data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted">
          Complete exams to see your score trend
        </div>
      </div>
    );
  }

  // Prepare data with nullable scores (fill gaps)
  const chartData = data.map((point) => ({
    date: point.date,
    score: point.score > 0 ? point.score : null,
    exams: point.examCount,
  }));

  return (
    <div className="space-y-3">
      {/* Sentiment Badge */}
      <div
        className={`rounded-lg px-3 py-2 text-sm font-medium ${
          sentiment === "BEARISH"
            ? "bg-red-500/10 text-red-600"
            : "bg-emerald-500/10 text-emerald-600"
        }`}
      >
        <span>{config.icon}</span> {config.message}
      </div>

      {/* Chart Container */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient
                id={config.gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={config.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={config.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="rgba(100,100,100,0.5)"
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="rgba(100,100,100,0.5)"
            />

            {/* 75% Passing Benchmark Reference Line */}
            <ReferenceLine
              y={75}
              stroke="rgba(100,100,100,0.3)"
              strokeDasharray="5 5"
              label={{
                value: "75% Pass Line",
                position: "right",
                fill: "rgba(100,100,100,0.6)",
                fontSize: 11,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(20,20,20,0.8)",
                border: "1px solid rgba(100,100,100,0.3)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) =>
                value !== null ? `${value}%` : "No exam"
              }
            />

            {/* Dynamic Line based on Sentiment */}
            <Line
              type="monotone"
              dataKey="score"
              stroke={config.color}
              strokeWidth={3}
              dot={{
                fill: config.color,
                r: 5,
              }}
              activeDot={{ r: 7 }}
              fill={`url(#${config.gradientId})`}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
