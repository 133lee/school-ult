"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AssessmentScore {
  type: "CAT" | "MID" | "EOT";
  score: number;
  rank: number;
  total: number;
  trend: "up" | "down" | "same";
}

interface StudentSubjectPerformanceProps {
  studentName: string;
  subjectName: string;
  assessments: AssessmentScore[];
  loading?: boolean;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(217 91% 60%)", // Blue color that works in both light and dark mode
  },
};

export function StudentSubjectPerformance({
  studentName,
  subjectName,
  assessments,
  loading = false,
}: StudentSubjectPerformanceProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{studentName}</CardTitle>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{studentName}</CardTitle>
              <p className="text-xs text-muted-foreground">{subjectName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p className="text-sm font-medium mb-1">No assessment results yet</p>
            <p className="text-xs">
              Results will appear once assessments are created and graded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = assessments.map((a) => ({
    assessment: a.type,
    score: a.score,
  }));

  const latestAssessment = assessments[assessments.length - 1];
  const averageScore =
    assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{studentName}</CardTitle>
            <p className="text-xs text-muted-foreground">{subjectName}</p>
          </div>
          <Badge
            variant="outline"
            className={
              latestAssessment.trend === "up"
                ? "bg-green-100 text-green-700 border-green-200"
                : latestAssessment.trend === "down"
                ? "bg-red-100 text-red-700 border-red-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }
          >
            {latestAssessment.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
            {latestAssessment.trend === "down" && (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {latestAssessment.trend === "same" && <Minus className="h-3 w-3 mr-1" />}
            {latestAssessment.trend === "up"
              ? "Improving"
              : latestAssessment.trend === "down"
              ? "Declining"
              : "Stable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Chart */}
        <div className="h-[120px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="assessment"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="score"
                  fill="var(--color-score)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Latest Score</p>
            <p className="text-lg font-bold text-primary">
              {latestAssessment.score}%
            </p>
          </div>
          <div className="text-center border-x">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-bold">{Math.round(averageScore)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Latest Rank</p>
            <p className="text-lg font-bold flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-600" />
              {latestAssessment.rank}/{latestAssessment.total}
            </p>
          </div>
        </div>

        {/* Assessment Details */}
        <div className="space-y-1 pt-2 border-t">
          {assessments.map((assessment) => (
            <div
              key={assessment.type}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground font-medium">
                {assessment.type}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{assessment.score}%</span>
                <span className="text-muted-foreground">
                  Rank {assessment.rank}/{assessment.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
