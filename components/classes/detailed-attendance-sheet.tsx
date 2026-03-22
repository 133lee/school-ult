"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

interface ClassData {
  id: string;
  name: string;
  gradeLevel?: string;
}

type AttendanceStatus = "P" | "A" | "L" | "E" | null;

interface Student {
  id: string;
  name: string;
  gender: "M" | "F";
  attendance: AttendanceStatus[];
}

interface AttendanceAPIResponse {
  students: Student[];
  month: number;
  year: number;
  daysInMonth: number;
}

interface DetailedAttendanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassData | null;
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

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [daysInMonth, setDaysInMonth] = useState(
    getDaysInMonth(currentMonth, currentYear)
  );
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!classData) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `/api/teacher/classes/${classData.id}/attendance?month=${currentMonth}&year=${currentYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();

          // API returns { success: true, data: {...} } - must check success flag
          if (!result.success) {
            console.error("API returned success=false:", result.error);
            setStudents([]);
            return;
          }

          const data: AttendanceAPIResponse = result.data;
          setStudents(data.students ?? []);
          setDaysInMonth(data.daysInMonth);
        } else {
          console.error("Failed to fetch attendance data");
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [classData, currentMonth, currentYear]);

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

  const calculateStats = (student: Student) => {
    const markedDays = student.attendance.filter((a) => a !== null);
    const present = student.attendance.filter((a) => a === "P").length;
    const late = student.attendance.filter((a) => a === "L").length;
    const excused = student.attendance.filter((a) => a === "E").length;
    const absent = student.attendance.filter((a) => a === "A").length;
    const total = markedDays.length;
    // Count Present and Late as attended
    const attended = present + late;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : "0";
    return { present, late, excused, absent, attended, percentage, total };
  };

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!students) return [];
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
      "Late",
      "Excused",
      "Absent",
      "Attended",
      "Total",
      "Rate",
    ];
    csvRows.push(headers.join(","));

    // Student rows
    filteredStudents.forEach((student) => {
      const stats = calculateStats(student);
      const attendanceMarks = student.attendance.map((att) => att || "-");
      const row = [
        `"${student.name}"`,
        ...attendanceMarks,
        stats.present,
        stats.late,
        stats.excused,
        stats.absent,
        stats.attended,
        stats.total,
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
        className="w-full sm:max-w-[95vw] lg:max-w-[85vw] p-0 flex flex-col duration-500 data-[state=closed]:duration-300">
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
                  {classData.gradeLevel && `${classData.gradeLevel} • `}Track
                  and view monthly attendance records
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
                    <div className="w-6 h-6 bg-yellow-100 border rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">L</span>
                    </div>
                    <span className="text-muted-foreground">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 border rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">E</span>
                    </div>
                    <span className="text-muted-foreground">Excused</span>
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
                </div>
              </div>

              {/* Attendance Table */}
              <Card className="overflow-hidden flex flex-col h-[500px]">
                {loading ? (
                  <Empty className="h-full">
                    <EmptyContent>
                      <EmptyMedia>
                        <CalendarIcon className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>Loading attendance data</EmptyTitle>
                        <EmptyDescription>
                          Please wait while we fetch the attendance records...
                        </EmptyDescription>
                      </EmptyHeader>
                    </EmptyContent>
                  </Empty>
                ) : !students?.length ? (
                  <Empty className="h-full">
                    <EmptyContent>
                      <EmptyMedia>
                        <CalendarIcon className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No students found</EmptyTitle>
                        <EmptyDescription>
                          There are no students enrolled in this class for the
                          selected period.
                        </EmptyDescription>
                      </EmptyHeader>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className="overflow-auto h-full">
                    <Table>
                      <TableHeader className="sticky top-0 z-20 bg-muted/50 backdrop-blur-sm">
                        <TableRow>
                          <TableHead className="sticky left-0 z-30 bg-muted/90 backdrop-blur-sm p-3 text-left font-semibold text-sm border-r border-b min-w-[200px]">
                            Student Name
                          </TableHead>
                          {days.map((day) => (
                            <TableHead
                              key={day}
                              className="p-2 text-center font-medium text-sm border-b min-w-[48px] text-muted-foreground">
                              <div className="flex flex-col items-center">
                                <span>{day}</span>
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="sticky right-0 z-30 bg-muted/90 backdrop-blur-sm p-3 text-center font-semibold text-sm border-l border-b min-w-[100px]">
                            Rate
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student, studentIdx) => {
                          const stats = calculateStats(student);
                          return (
                            <TableRow
                              key={student.id}
                              className={`border-b hover:bg-muted/30 transition-colors ${
                                studentIdx % 2 === 0
                                  ? "bg-background"
                                  : "bg-muted/10"
                              }`}>
                              <TableCell className="sticky left-0 z-10 bg-inherit backdrop-blur-sm p-3 font-medium border-r">
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
                              </TableCell>
                              {days.map((day, dayIndex) => {
                                const status = student.attendance[dayIndex];
                                const bgColor =
                                  status === null
                                    ? "bg-background"
                                    : status === "P"
                                    ? "bg-green-100"
                                    : status === "L"
                                    ? "bg-yellow-100"
                                    : status === "E"
                                    ? "bg-blue-100"
                                    : "bg-red-100";

                                return (
                                  <TableCell
                                    key={day}
                                    className={`p-1 text-center border ${bgColor}`}>
                                    <div className="h-10 w-10 rounded-md flex items-center justify-center mx-auto">
                                      <span
                                        className={`text-xs font-semibold ${
                                          status === null
                                            ? "text-muted-foreground"
                                            : ""
                                        }`}>
                                        {status || "-"}
                                      </span>
                                    </div>
                                  </TableCell>
                                );
                              })}
                              <TableCell className="sticky right-0 z-10 bg-inherit backdrop-blur-sm p-3 text-center border-l">
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-sm">
                                    {stats.percentage}%
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {stats.attended}/{stats.total}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>

              {/* Export Button - Centered below table */}
              {!loading && students && students.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportAttendance}>
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="statistics"
              className="flex-1 mt-4 overflow-hidden">
              <Empty className="h-full">
                <EmptyContent>
                  <EmptyMedia>
                    <CalendarIcon className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>Statistics Coming Soon</EmptyTitle>
                    <EmptyDescription>
                      Attendance statistics and analytics will be available
                      here.
                      <br />
                      This section will display gender comparison charts, top
                      performers, and daily attendance patterns.
                    </EmptyDescription>
                  </EmptyHeader>
                </EmptyContent>
              </Empty>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
