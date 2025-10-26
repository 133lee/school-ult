"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple bar chart for class performance";

interface ChartDataPoint {
  class: string;
  average: number;
  high: number;
  low: number;
}

const chartConfig = {
  average: {
    label: "Class Average",
    color: "var(--chart-1)",
  },
  high: {
    label: "Highest Score",
    color: "var(--chart-2)",
  },
  low: {
    label: "Lowest Score",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function HODPerformanceChart({ data }: { data: ChartDataPoint[] }) {
  const avgPerformance = (
    data.reduce((sum, d) => sum + d.average, 0) / data.length
  ).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Performance Overview</CardTitle>
        <CardDescription>Average, highest, and lowest scores by class</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="class"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="average" fill="var(--color-average)" radius={3} maxBarSize={40} />
            <Bar dataKey="high" fill="var(--color-high)" radius={3} maxBarSize={40} />
            <Bar dataKey="low" fill="var(--color-low)" radius={3} maxBarSize={40} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Average performance: {avgPerformance}%{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing class averages, highest, and lowest scores
        </div>
      </CardFooter>
    </Card>
  );
}
