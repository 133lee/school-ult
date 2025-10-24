"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Calendar as CalendarIcon,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Class {
  id: string;
  name: string;
  gradeLevel: string;
}

interface Student {
  id: string;
  name: string;
  gender: "Male" | "Female";
  attendance: (boolean | null)[];
}

interface DetailedAttendanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: Class | null;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export function DetailedAttendanceSheet({
  open,
  onOpenChange,
  classData,
}: DetailedAttendanceSheetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"attendance" | "statistics">(
    "attendance"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Collapsible states for column 2
  const [topPerformersOpen, setTopPerformersOpen] = useState(true);
  const [bottomPerformersOpen, setBottomPerformersOpen] = useState(false);

  // Collapsible states for column 3
  const [bestDaysOpen, setBestDaysOpen] = useState(true);
  const [worstDaysOpen, setWorstDaysOpen] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Generate mock students with realistic attendance patterns
  const [students, setStudents] = useState<Student[]>(() => {
    const studentsData = [
      { name: "Alex Smith", gender: "Male" as const },
      { name: "Alice Wonder", gender: "Female" as const },
      { name: "Brinda Sloan", gender: "Female" as const },
      { name: "Britney Spears", gender: "Female" as const },
      { name: "Calvin Klein", gender: "Male" as const },
      { name: "Christina Perri", gender: "Female" as const },
      { name: "Diana Chase", gender: "Female" as const },
      { name: "Emily Clarke", gender: "Female" as const },
      { name: "Floyd Williams", gender: "Male" as const },
      { name: "George Miller", gender: "Male" as const },
      { name: "Hannah Baker", gender: "Female" as const },
      { name: "Isaac Newton", gender: "Male" as const },
    ];

    return studentsData.map((student, idx) => ({
      id: `${idx + 1}`,
      name: student.name,
      gender: student.gender,
      attendance: Array.from({ length: daysInMonth }, (_, i) => {
        // Only populate days up to today or 19th (whichever is earlier)
        const today = new Date();
        const isCurrentMonth =
          currentMonth === today.getMonth() &&
          currentYear === today.getFullYear();
        const maxDay = isCurrentMonth ? Math.min(today.getDate(), 19) : 19;

        if (i >= maxDay) return null;

        // Generate realistic absence patterns (mostly present with occasional absences)
        const randomAbsences = [6, 7, 10, 11, 15, 16];
        const studentAbsences = randomAbsences.filter(
          () => Math.random() > 0.7
        );
        return !studentAbsences.includes(i);
      }),
    }));
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setCalendarOpen(false);
    }
  };

  const toggleAttendance = (studentId: string, dayIndex: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              attendance: student.attendance.map((att, idx) => {
                if (idx === dayIndex) {
                  if (att === null) return true;
                  if (att === true) return false;
                  return true;
                }
                return att;
              }),
            }
          : student
      )
    );
  };

  const calculateStats = (student: Student) => {
    const markedDays = student.attendance.filter((a) => a !== null);
    const present = student.attendance.filter((a) => a === true).length;
    const absent = student.attendance.filter((a) => a === false).length;
    const total = markedDays.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0";
    return { present, absent, percentage, total };
  };

  // Calculate daily attendance patterns
  const calculateDailyAttendance = useMemo(() => {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const dailyStats: { day: string; presentCount: number; totalCount: number; percentage: number }[] = [];

    // Get first 5 days (Mon-Fri) of marked attendance
    for (let dayIndex = 0; dayIndex < Math.min(5, daysInMonth); dayIndex++) {
      let presentCount = 0;
      let totalCount = 0;

      students.forEach((student) => {
        const status = student.attendance[dayIndex];
        if (status !== null) {
          totalCount++;
          if (status === true) presentCount++;
        }
      });

      if (totalCount > 0) {
        dailyStats.push({
          day: weekdays[dayIndex] || `Day ${dayIndex + 1}`,
          presentCount,
          totalCount,
          percentage: Math.round((presentCount / totalCount) * 100),
        });
      }
    }

    // Sort to find best and worst
    const sorted = [...dailyStats].sort((a, b) => b.percentage - a.percentage);
    const bestDays = sorted.slice(0, 2);
    const worstDays = sorted.slice(-2).reverse();

    return { bestDays, worstDays, allDays: dailyStats };
  }, [students, daysInMonth]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleExportAttendance = () => {
    if (!classData) return;

    // Create CSV content
    const csvRows = [];

    // Header row
    const headers = [
      "Student Name",
      ...days.map((d) => `Day ${d}`),
      "Present",
      "Absent",
      "Rate",
    ];
    csvRows.push(headers.join(","));

    // Student rows
    filteredStudents.forEach((student) => {
      const stats = calculateStats(student);
      const attendanceMarks = student.attendance.map((att) =>
        att === null ? "-" : att ? "P" : "A"
      );
      const row = [
        `"${student.name}"`,
        ...attendanceMarks,
        stats.present,
        stats.absent,
        `${stats.percentage}%`,
      ];
      csvRows.push(row.join(","));
    });

    // Create blob and download
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${classData.name}_Attendance_${months[currentMonth]}_${currentYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!classData) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[95vw] lg:max-w-[85vw] p-0 flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as "attendance" | "statistics")
          }
          className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <SheetTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Detailed Attendance - {classData.name}
                </SheetTitle>
                <SheetDescription>
                  {classData.gradeLevel} • Track and manage monthly attendance
                  records
                </SheetDescription>
              </div>
              <TabsList className="grid grid-cols-2 mr-5">
                <TabsTrigger value="attendance">Attendance Grid</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden px-6 py-4">
            <TabsContent
              value="attendance"
              className="flex-1 mt-4 overflow-hidden flex flex-col">
              {/* Month Navigation and Search */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="min-w-[180px] justify-center font-semibold">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {months[currentMonth]} {currentYear}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={handleDateSelect}
                        month={currentDate}
                        onMonthChange={setCurrentDate}
                        captionLayout="dropdown"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Search Student */}
                  <div className="relative w-[280px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search student by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 border rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">P</span>
                    </div>
                    <span className="text-muted-foreground">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 border rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">A</span>
                    </div>
                    <span className="text-muted-foreground">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 border rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">-</span>
                    </div>
                    <span className="text-muted-foreground">Not Marked</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAttendance}
                    className="ml-2">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Attendance Table with dual scroll and fixed height */}
              <Card className="overflow-hidden flex flex-col h-[520px]">
                <div className="overflow-auto h-full">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20 bg-muted/50 backdrop-blur-sm">
                      <tr>
                        <th className="sticky left-0 z-30 bg-muted/90 backdrop-blur-sm p-3 text-left font-semibold text-sm border-r border-b min-w-[200px]">
                          Student Name
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className="p-2 text-center font-medium text-sm border-b min-w-[48px] text-muted-foreground">
                            <div className="flex flex-col items-center">
                              <span>{day}</span>
                            </div>
                          </th>
                        ))}
                        <th className="sticky right-0 z-30 bg-muted/90 backdrop-blur-sm p-3 text-center font-semibold text-sm border-l border-b min-w-[100px]">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, studentIdx) => {
                        const stats = calculateStats(student);
                        return (
                          <tr
                            key={student.id}
                            className={`border-b hover:bg-muted/30 transition-colors ${
                              studentIdx % 2 === 0
                                ? "bg-background"
                                : "bg-muted/10"
                            }`}>
                            <td className="sticky left-0 z-10 bg-inherit backdrop-blur-sm p-3 font-medium border-r">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm whitespace-nowrap">
                                  {student.name}
                                </span>
                              </div>
                            </td>
                            {days.map((day, dayIndex) => {
                              const status = student.attendance[dayIndex];
                              return (
                                <td
                                  key={day}
                                  className={`p-1 text-center border ${
                                    status === null
                                      ? "bg-background"
                                      : status
                                      ? "bg-green-100"
                                      : "bg-red-100"
                                  }`}>
                                  <button
                                    className="h-10 w-10 rounded-md flex items-center justify-center hover:opacity-70 transition-opacity"
                                    onClick={() =>
                                      toggleAttendance(student.id, dayIndex)
                                    }>
                                    {status === null ? (
                                      <span className="text-muted-foreground text-xs font-semibold">
                                        -
                                      </span>
                                    ) : status ? (
                                      <span className="text-xs font-semibold">
                                        P
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold">
                                        A
                                      </span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                            <td className="sticky right-0 z-10 bg-inherit backdrop-blur-sm p-3 text-center border-l">
                              <div className="flex flex-col items-center">
                                <span className="font-semibold text-sm">
                                  {stats.percentage}%
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {stats.present}/{stats.total}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent
              value="statistics"
              className="flex-1 mt-4 overflow-hidden">
              <div className="h-full pr-2">
                <div className="grid grid-cols-3 gap-4">
                  {/* Column 1: Radar Chart for Male vs Female Attendance */}
                  <div className="col-span-1">
                    <Card className="max-h-[520px]">
                      <CardHeader className="items-center pb-4">
                        <CardTitle className="text-base">
                          Gender Comparison
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Weekly patterns: Mon - Fri
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            male: {
                              label: "Male",
                              color: "hsl(210, 100%, 70%)",
                            },
                            female: {
                              label: "Female",
                              color: "hsl(0, 0%, 60%)",
                            },
                          } satisfies ChartConfig}
                          className="mx-auto aspect-square max-h-[250px]">
                          <RadarChart
                            data={[
                              { day: "Mon", male: 95, female: 92 },
                              { day: "Tue", male: 88, female: 94 },
                              { day: "Wed", male: 92, female: 89 },
                              { day: "Thu", male: 85, female: 91 },
                              { day: "Fri", male: 90, female: 87 },
                            ]}
                            margin={{
                              top: -40,
                              bottom: -10,
                            }}>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="line" />}
                            />
                            <PolarAngleAxis dataKey="day" />
                            <PolarGrid />
                            <Radar
                              dataKey="male"
                              fill="var(--color-male)"
                              fillOpacity={0.6}
                            />
                            <Radar
                              dataKey="female"
                              fill="var(--color-female)"
                              fillOpacity={0.3}
                            />
                            <ChartLegend
                              className="mt-8"
                              content={<ChartLegendContent />}
                            />
                          </RadarChart>
                        </ChartContainer>
                      </CardContent>
                      <CardFooter className="flex-col gap-2 pt-4 text-xs">
                        <div className="flex items-center gap-2 leading-none font-medium">
                          Overall: 90.2%{" "}
                          <TrendingUp className="h-3 w-3" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                          {months[currentMonth]} {currentYear}
                        </div>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Column 2: Top & Bottom Performers */}
                  <div className="col-span-1 space-y-4 max-h-[520px] overflow-y-auto">
                    {/* Top 5 Best Attendance */}
                    <Collapsible
                      open={topPerformersOpen}
                      onOpenChange={(isOpen) => {
                        setTopPerformersOpen(isOpen);
                        if (isOpen) setBottomPerformersOpen(false);
                      }}>
                      <Card>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="pb-3 hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Top 5 Best
                              </div>
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="space-y-2">
                          {filteredStudents
                            .map((student) => ({
                              student,
                              stats: calculateStats(student),
                            }))
                            .sort(
                              (a, b) =>
                                parseFloat(b.stats.percentage) -
                                parseFloat(a.stats.percentage)
                            )
                            .slice(0, 5)
                            .map(({ student, stats }, index) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">
                                      {student.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {student.gender}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-green-600">
                                    {stats.percentage}%
                                  </p>
                                </div>
                              </div>
                            ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>

                    {/* Bottom 5 Worst Attendance */}
                    <Collapsible
                      open={bottomPerformersOpen}
                      onOpenChange={(isOpen) => {
                        setBottomPerformersOpen(isOpen);
                        if (isOpen) setTopPerformersOpen(false);
                      }}>
                      <Card>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="pb-3 hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                Bottom 5
                              </div>
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="space-y-2">
                          {filteredStudents
                            .map((student) => ({
                              student,
                              stats: calculateStats(student),
                            }))
                            .sort(
                              (a, b) =>
                                parseFloat(a.stats.percentage) -
                                parseFloat(b.stats.percentage)
                            )
                            .slice(0, 5)
                            .map(({ student, stats }, index) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">
                                      {student.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {student.gender}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-red-600">
                                    {stats.percentage}%
                                  </p>
                                </div>
                              </div>
                            ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </div>

                  {/* Column 3: Best & Worst Days */}
                  <div className="col-span-1 max-h-[520px] overflow-y-auto space-y-4">
                    {/* Best Days Section */}
                    <Collapsible
                      open={bestDaysOpen}
                      onOpenChange={(isOpen) => {
                        setBestDaysOpen(isOpen);
                        if (isOpen) setWorstDaysOpen(false);
                      }}>
                      <Card>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Best Attendance Days
                              </div>
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="space-y-2">
                            {calculateDailyAttendance.bestDays.map((dayData, index) => (
                              <div
                                key={dayData.day}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  index === 0
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-green-50/50 border"
                                }`}>
                                <div>
                                  <p className="font-semibold text-sm">
                                    {dayData.day}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {dayData.presentCount}/{dayData.totalCount} present
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`${index === 0 ? "text-2xl" : "text-xl"} font-bold text-green-600`}>
                                    {dayData.percentage}%
                                  </p>
                                  {index === 0 && (
                                    <Badge
                                      variant="default"
                                      className="bg-green-600 text-xs mt-1">
                                      Best
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>

                    {/* Worst Days Section */}
                    <Collapsible
                      open={worstDaysOpen}
                      onOpenChange={(isOpen) => {
                        setWorstDaysOpen(isOpen);
                        if (isOpen) setBestDaysOpen(false);
                      }}>
                      <Card>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                                Needs Improvement
                              </div>
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="space-y-2">
                            {calculateDailyAttendance.worstDays.map((dayData, index) => (
                              <div
                                key={dayData.day}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  index === 0
                                    ? "bg-red-50 border border-red-200"
                                    : "bg-red-50/50 border"
                                }`}>
                                <div>
                                  <p className="font-semibold text-sm">
                                    {dayData.day}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {dayData.presentCount}/{dayData.totalCount} present
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`${index === 0 ? "text-2xl" : "text-xl"} font-bold text-red-600`}>
                                    {dayData.percentage}%
                                  </p>
                                  {index === 0 && (
                                    <Badge
                                      variant="destructive"
                                      className="bg-red-600 text-xs mt-1">
                                      Lowest
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
