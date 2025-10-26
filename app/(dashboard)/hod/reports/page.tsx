"use client";

import React, { useState } from "react";
import { useHODAuth } from "@/hooks/useHODAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GraduationCap, ClipboardList, TrendingUp } from "lucide-react";
import { HODPerformanceChart } from "@/components/charts/hod-performance-chart";

const HODReports = () => {
  const { currentHOD, isLoading } = useHODAuth();
  const [timeRange, setTimeRange] = useState("90d");

  // Sample data - Classes HOD teaches
  const classPerformance = [
    { class: "9A", average: 75, high: 95, low: 45 },
    { class: "10A", average: 82, high: 98, low: 55 },
    { class: "11A", average: 78, high: 92, low: 50 },
  ];

  // Attendance data - Male and Female breakdown
  const attendanceData = [
    { date: "2024-04-01", male: 222, female: 150 },
    { date: "2024-04-02", male: 97, female: 180 },
    { date: "2024-04-03", male: 167, female: 120 },
    { date: "2024-04-04", male: 242, female: 260 },
    { date: "2024-04-05", male: 373, female: 290 },
    { date: "2024-04-06", male: 301, female: 340 },
    { date: "2024-04-07", male: 245, female: 180 },
    { date: "2024-04-08", male: 409, female: 320 },
    { date: "2024-04-09", male: 59, female: 110 },
    { date: "2024-04-10", male: 261, female: 190 },
    { date: "2024-04-11", male: 327, female: 350 },
    { date: "2024-04-12", male: 292, female: 210 },
    { date: "2024-04-13", male: 342, female: 380 },
    { date: "2024-04-14", male: 137, female: 220 },
    { date: "2024-04-15", male: 120, female: 170 },
    { date: "2024-04-16", male: 138, female: 190 },
    { date: "2024-04-17", male: 446, female: 360 },
    { date: "2024-04-18", male: 364, female: 410 },
    { date: "2024-04-19", male: 243, female: 180 },
    { date: "2024-04-20", male: 89, female: 150 },
    { date: "2024-04-21", male: 137, female: 200 },
    { date: "2024-04-22", male: 224, female: 170 },
    { date: "2024-04-23", male: 138, female: 230 },
    { date: "2024-04-24", male: 387, female: 290 },
    { date: "2024-04-25", male: 215, female: 250 },
    { date: "2024-04-26", male: 75, female: 130 },
    { date: "2024-04-27", male: 383, female: 420 },
    { date: "2024-04-28", male: 122, female: 180 },
    { date: "2024-04-29", male: 315, female: 240 },
    { date: "2024-04-30", male: 454, female: 380 },
    { date: "2024-05-01", male: 165, female: 220 },
    { date: "2024-05-02", male: 293, female: 310 },
    { date: "2024-05-03", male: 247, female: 190 },
    { date: "2024-05-04", male: 385, female: 420 },
    { date: "2024-05-05", male: 481, female: 390 },
    { date: "2024-05-06", male: 498, female: 520 },
    { date: "2024-05-07", male: 388, female: 300 },
    { date: "2024-05-08", male: 149, female: 210 },
    { date: "2024-05-09", male: 227, female: 180 },
    { date: "2024-05-10", male: 293, female: 330 },
    { date: "2024-05-11", male: 335, female: 270 },
    { date: "2024-05-12", male: 197, female: 240 },
    { date: "2024-05-13", male: 197, female: 160 },
    { date: "2024-05-14", male: 448, female: 490 },
    { date: "2024-05-15", male: 473, female: 380 },
    { date: "2024-05-16", male: 338, female: 400 },
    { date: "2024-05-17", male: 499, female: 420 },
    { date: "2024-05-18", male: 315, female: 350 },
    { date: "2024-05-19", male: 235, female: 180 },
    { date: "2024-05-20", male: 177, female: 230 },
    { date: "2024-05-21", male: 82, female: 140 },
    { date: "2024-05-22", male: 81, female: 120 },
    { date: "2024-05-23", male: 252, female: 290 },
    { date: "2024-05-24", male: 294, female: 220 },
    { date: "2024-05-25", male: 201, female: 250 },
    { date: "2024-05-26", male: 213, female: 170 },
    { date: "2024-05-27", male: 420, female: 460 },
    { date: "2024-05-28", male: 233, female: 190 },
    { date: "2024-05-29", male: 78, female: 130 },
    { date: "2024-05-30", male: 340, female: 280 },
    { date: "2024-05-31", male: 178, female: 230 },
    { date: "2024-06-01", male: 178, female: 200 },
    { date: "2024-06-02", male: 470, female: 410 },
    { date: "2024-06-03", male: 103, female: 160 },
    { date: "2024-06-04", male: 439, female: 380 },
    { date: "2024-06-05", male: 88, female: 140 },
    { date: "2024-06-06", male: 294, female: 250 },
    { date: "2024-06-07", male: 323, female: 370 },
    { date: "2024-06-08", male: 385, female: 320 },
    { date: "2024-06-09", male: 438, female: 480 },
    { date: "2024-06-10", male: 155, female: 200 },
    { date: "2024-06-11", male: 92, female: 150 },
    { date: "2024-06-12", male: 492, female: 420 },
    { date: "2024-06-13", male: 81, female: 130 },
    { date: "2024-06-14", male: 426, female: 380 },
    { date: "2024-06-15", male: 307, female: 350 },
    { date: "2024-06-16", male: 371, female: 310 },
    { date: "2024-06-17", male: 475, female: 520 },
    { date: "2024-06-18", male: 107, female: 170 },
    { date: "2024-06-19", male: 341, female: 290 },
    { date: "2024-06-20", male: 408, female: 450 },
    { date: "2024-06-21", male: 169, female: 210 },
    { date: "2024-06-22", male: 317, female: 270 },
    { date: "2024-06-23", male: 480, female: 530 },
    { date: "2024-06-24", male: 132, female: 180 },
    { date: "2024-06-25", male: 141, female: 190 },
    { date: "2024-06-26", male: 434, female: 380 },
    { date: "2024-06-27", male: 448, female: 490 },
    { date: "2024-06-28", male: 149, female: 200 },
    { date: "2024-06-29", male: 103, female: 160 },
    { date: "2024-06-30", male: 446, female: 400 },
  ];

  const chartConfig = {
    male: {
      label: "Male",
      color: "var(--chart-1)",
    },
    female: {
      label: "Female",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const filteredAttendanceData = attendanceData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentHOD) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Class Comparison Reports ({currentHOD.department})</h1>
        <p className="text-muted-foreground text-sm">
          Compare performance across all classes you teach
        </p>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="performance">
            <GraduationCap className="h-4 w-4 mr-2" />
            Class Performance
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <ClipboardList className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab - Class Comparison */}
        <TabsContent value="performance" className="space-y-6">
          {/* KPI Cards - Actionable Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">At-Risk Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">1</div>
                <p className="text-xs text-muted-foreground mt-1">Class 9A below 70%</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Performance Spread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">7%</div>
                <p className="text-xs text-muted-foreground mt-1">82% - 75% range</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">91.2%</div>
                <p className="text-xs text-muted-foreground mt-1">Students scoring &gt; 60%</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">+2.1%</div>
                <p className="text-xs text-muted-foreground mt-1">vs previous month</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <HODPerformanceChart data={classPerformance} />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          {/* KPI Cards - Attendance Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Gender Gap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">12%</div>
                <p className="text-xs text-muted-foreground mt-1">Female attendance higher</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Critical Threshold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">0</div>
                <p className="text-xs text-muted-foreground mt-1">Classes below 80%</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">↑ 1.2%</div>
                <p className="text-xs text-muted-foreground mt-1">Improving over time</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Chronic Absences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">5</div>
                <p className="text-xs text-muted-foreground mt-1">Students below 75%</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Area Chart */}
          <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row pb-0">
              <div className="grid flex-1 gap-1">
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>
                  Showing attendance percentage over time
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                  aria-label="Select a value"
                >
                  <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">
                    Last 3 months
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="7d" className="rounded-lg">
                    Last 7 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <AreaChart data={filteredAttendanceData}>
                  <defs>
                    <linearGradient id="fillMale" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-male)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-male)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillFemale" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-female)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-female)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="female"
                    type="natural"
                    fill="url(#fillFemale)"
                    stroke="var(--color-female)"
                    stackId="a"
                  />
                  <Area
                    dataKey="male"
                    type="natural"
                    fill="url(#fillMale)"
                    stroke="var(--color-male)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HODReports;
