"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  ClipboardList,
  Grid3x3,
  List,
  Download,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  studentId: string;
  gender: string;
  photoUrl?: string;
}

interface SessionEntry {
  date: string;
  status: "Present" | "Absent" | "Late";
  classRegisterStatus?: "P" | "L" | "A" | "L-AR" | "E"; // From morning register
}

interface SessionRegisterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    id: string;
    name: string;
    gradeLevel: string;
    teachingSubject?: string; // Subject being taught
  } | null;
}

// Mock student data
const mockStudents: Student[] = [
  { id: "1", name: "John Doe", studentId: "STU001", gender: "Male" },
  { id: "2", name: "Jane Smith", studentId: "STU002", gender: "Female" },
  { id: "3", name: "Mike Johnson", studentId: "STU003", gender: "Male" },
  { id: "4", name: "Sarah Williams", studentId: "STU004", gender: "Female" },
  { id: "5", name: "David Brown", studentId: "STU005", gender: "Male" },
];

// Mock session attendance history
const mockSessionHistory: Record<string, SessionEntry[]> = {
  "1": [
    { date: "2024-12-13", status: "Present", classRegisterStatus: "P" },
    { date: "2024-12-12", status: "Present", classRegisterStatus: "P" },
    {
      date: "2024-12-11",
      status: "Present",
      classRegisterStatus: "L-AR", // Was late to school but present in lesson
    },
    { date: "2024-12-10", status: "Present", classRegisterStatus: "P" },
    { date: "2024-12-09", status: "Late", classRegisterStatus: "L" },
  ],
  "2": [
    { date: "2024-12-13", status: "Present", classRegisterStatus: "P" },
    { date: "2024-12-12", status: "Present", classRegisterStatus: "P" },
    { date: "2024-12-11", status: "Present", classRegisterStatus: "P" },
    { date: "2024-12-10", status: "Absent", classRegisterStatus: "A" },
    { date: "2024-12-09", status: "Present", classRegisterStatus: "P" },
  ],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-700 border-green-300";
    case "Late":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Absent":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getDisplayStatus = (
  sessionStatus: string,
  registerStatus?: string
): string => {
  if (registerStatus === "A") return "A (Register)"; // Absent from morning register
  if (registerStatus === "L-AR" && sessionStatus === "Present")
    return "L/P"; // Late to school but present in lesson
  return sessionStatus;
};

export function SessionRegisterSheet({
  open,
  onOpenChange,
  classData,
}: SessionRegisterSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2024-12-13");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedMonth, setSelectedMonth] = useState("2024-12");

  // Filter students
  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats for selected date
  const getSessionStats = () => {
    let present = 0,
      late = 0,
      absent = 0;

    mockStudents.forEach((student) => {
      const history = mockSessionHistory[student.id] || [];
      const entry = history.find((h) => h.date === selectedDate);
      if (entry) {
        switch (entry.status) {
          case "Present":
            present++;
            break;
          case "Late":
            late++;
            break;
          case "Absent":
            absent++;
            break;
        }
      }
    });

    return { present, late, absent };
  };

  // Generate days in month
  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Calculate attendance rate
  const getAttendanceRate = (studentId: string) => {
    const history = mockSessionHistory[studentId] || [];
    const monthHistory = history.filter((h) => h.date.startsWith(selectedMonth));

    if (monthHistory.length === 0) return { rate: 0, attended: 0, total: 0 };

    const attended = monthHistory.filter((h) => h.status === "Present" || h.status === "Late").length;
    const total = monthHistory.length;
    const rate = (attended / total) * 100;

    return { rate: rate.toFixed(1), attended, total };
  };

  // Get status for specific date
  const getStatusForDate = (studentId: string, day: number) => {
    const dateStr = `${selectedMonth}-${day.toString().padStart(2, "0")}`;
    const history = mockSessionHistory[studentId] || [];
    const entry = history.find((h) => h.date === dateStr);
    return entry?.status || null;
  };

  const stats = getSessionStats();
  const daysInMonth = getDaysInMonth(selectedMonth);

  if (!classData) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <SheetTitle className="text-xl">Session Register</SheetTitle>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {classData.name} • {classData.gradeLevel}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Subject: {classData.teachingSubject || "General"}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {viewMode === "list" ? (
                      <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger className="w-[200px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-12-13">Friday, Dec 13, 2024</SelectItem>
                          <SelectItem value="2024-12-12">Thursday, Dec 12, 2024</SelectItem>
                          <SelectItem value="2024-12-11">Wednesday, Dec 11, 2024</SelectItem>
                          <SelectItem value="2024-12-10">Tuesday, Dec 10, 2024</SelectItem>
                          <SelectItem value="2024-12-09">Monday, Dec 9, 2024</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[150px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-12">December 2024</SelectItem>
                          <SelectItem value="2024-11">November 2024</SelectItem>
                          <SelectItem value="2024-10">October 2024</SelectItem>
                          <SelectItem value="2024-09">September 2024</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={viewMode === "list" ? "default" : "outline"}
                      onClick={() => setViewMode("list")}
                      className="h-8 px-3">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "grid" ? "default" : "outline"}
                      onClick={() => setViewMode("grid")}
                      className="h-8 px-3">
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats (list view only) */}
            {viewMode === "list" && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-600">{stats.present}</div>
                  <div className="text-[10px] text-gray-600">Present</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-yellow-600">{stats.late}</div>
                  <div className="text-[10px] text-gray-600">Late</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-red-600">{stats.absent}</div>
                  <div className="text-[10px] text-gray-600">Absent</div>
                </div>
              </div>
            )}
          </SheetHeader>

          {/* Search and Export */}
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {viewMode === "grid" && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          {/* Content - List or Grid View */}
          <div className="flex-1 overflow-auto px-6">
            {viewMode === "list" ? (
              // LIST VIEW
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-background border-b">
                  <tr>
                    <th className="p-3 text-left font-semibold text-sm bg-background">
                      Student
                    </th>
                    <th className="p-3 text-center font-semibold text-sm bg-background">
                      Session Status
                    </th>
                    <th className="p-3 text-center font-semibold text-sm bg-background">
                      Register Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const history = mockSessionHistory[student.id] || [];
                    const entry = history.find((h) => h.date === selectedDate);

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-muted/70 transition-colors ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/30"
                        }`}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {entry ? (
                            <div className="flex items-center justify-center">
                              <Badge
                                variant="outline"
                                className={getStatusColor(entry.status)}>
                                {getDisplayStatus(entry.status, entry.classRegisterStatus)}
                              </Badge>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-muted-foreground">
                              No record
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {entry?.classRegisterStatus ? (
                            <div className="flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                {entry.classRegisterStatus === "P"
                                  ? "Present"
                                  : entry.classRegisterStatus === "L"
                                  ? "Late"
                                  : entry.classRegisterStatus === "A"
                                  ? "Absent"
                                  : entry.classRegisterStatus === "L-AR"
                                  ? "Late After Reg"
                                  : "Excused"}
                              </span>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-muted-foreground">
                              -
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              // GRID VIEW
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead className="sticky top-0 z-20 bg-background">
                    <tr>
                      <th className="p-2 text-left font-semibold bg-background border sticky left-0 z-30 min-w-[120px]">
                        Student Name
                      </th>
                      {daysInMonth.map((day) => (
                        <th
                          key={day}
                          className="p-2 text-center font-semibold bg-background border min-w-[35px]">
                          {day}
                        </th>
                      ))}
                      <th className="p-2 text-center font-semibold bg-background border sticky right-0 z-30 min-w-[80px]">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const attendanceRate = getAttendanceRate(student.id);
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-muted/70 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/30"
                          }`}>
                          <td className="p-2 border sticky left-0 z-20 bg-inherit">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-xs">{student.name}</span>
                            </div>
                          </td>
                          {daysInMonth.map((day) => {
                            const status = getStatusForDate(student.id, day);
                            return (
                              <td key={day} className="p-1 border text-center">
                                {status ? (
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${
                                      status === "Present"
                                        ? "bg-green-100 text-green-700"
                                        : status === "Late"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                    {status === "Present" ? "P" : status === "Late" ? "L" : "A"}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-2 border text-center sticky right-0 z-20 bg-inherit">
                            <div className="flex flex-col">
                              <span className="font-bold text-xs">{attendanceRate.rate}%</span>
                              <span className="text-[10px] text-muted-foreground">
                                {attendanceRate.attended}/{attendanceRate.total}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Legend */}
                <div className="mt-4 pb-4 flex items-center gap-4 text-xs">
                  <span className="font-semibold">Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-100 text-green-700 font-bold">
                      P
                    </span>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-yellow-100 text-yellow-700 font-bold">
                      L
                    </span>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-700 font-bold">
                      A
                    </span>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-300">-</span>
                    <span>Not Marked</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
