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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Calendar,
  History,
  TrendingDown,
  TrendingUp,
  AlertCircle,
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

interface RegisterEntry {
  date: string;
  status: "P" | "L" | "A" | "L-AR" | "E";
  amendments?: Amendment[];
}

interface Amendment {
  originalStatus: string;
  newStatus: string;
  amendedAt: Date;
  reason: string;
  reportedBy?: string;
}

interface RegisterHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    id: string;
    name: string;
    gradeLevel: string;
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

// Mock register history data
const mockRegisterHistory: Record<string, RegisterEntry[]> = {
  "1": [
    { date: "2024-12-13", status: "P" },
    { date: "2024-12-12", status: "P" },
    {
      date: "2024-12-11",
      status: "L-AR",
      amendments: [
        {
          originalStatus: "A",
          newStatus: "L-AR",
          amendedAt: new Date("2024-12-11T10:05:00"),
          reason: "Auto-updated: Student present in Mathematics at 10:00 AM",
          reportedBy: "Ms. Johnson",
        },
      ],
    },
    { date: "2024-12-10", status: "P" },
    { date: "2024-12-09", status: "L" },
  ],
  "2": [
    { date: "2024-12-13", status: "P" },
    { date: "2024-12-12", status: "P" },
    { date: "2024-12-11", status: "P" },
    { date: "2024-12-10", status: "A" },
    { date: "2024-12-09", status: "P" },
  ],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "P":
      return "bg-green-100 text-green-700 border-green-300";
    case "L":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "A":
      return "bg-red-100 text-red-700 border-red-300";
    case "L-AR":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "E":
      return "bg-blue-100 text-blue-700 border-blue-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "P":
      return "Present";
    case "L":
      return "Late";
    case "A":
      return "Absent";
    case "L-AR":
      return "Late After Register";
    case "E":
      return "Excused";
    default:
      return status;
  }
};

export function RegisterHistorySheet({
  open,
  onOpenChange,
  classData,
}: RegisterHistorySheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2024-12-13");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showAmendments, setShowAmendments] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedMonth, setSelectedMonth] = useState("2024-12");

  // Filter students
  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate attendance stats for selected date
  const getAttendanceStats = () => {
    let present = 0, late = 0, absent = 0, lateAfterRegister = 0, excused = 0;

    mockStudents.forEach((student) => {
      const history = mockRegisterHistory[student.id] || [];
      const entry = history.find((h) => h.date === selectedDate);
      if (entry) {
        switch (entry.status) {
          case "P": present++; break;
          case "L": late++; break;
          case "A": absent++; break;
          case "L-AR": lateAfterRegister++; break;
          case "E": excused++; break;
        }
      }
    });

    return { present, late, absent, lateAfterRegister, excused };
  };

  const stats = getAttendanceStats();

  const handleViewAmendments = (studentId: string) => {
    setSelectedStudent(studentId);
    setShowAmendments(true);
  };

  // Generate days in month
  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Calculate attendance rate for a student
  const getAttendanceRate = (studentId: string) => {
    const history = mockRegisterHistory[studentId] || [];
    const monthHistory = history.filter((h) => h.date.startsWith(selectedMonth));

    if (monthHistory.length === 0) return { rate: 0, attended: 0, total: 0 };

    const attended = monthHistory.filter((h) => h.status === "P" || h.status === "L" || h.status === "L-AR").length;
    const total = monthHistory.length;
    const rate = (attended / total) * 100;

    return { rate: rate.toFixed(1), attended, total };
  };

  // Get status for a specific date
  const getStatusForDate = (studentId: string, day: number) => {
    const dateStr = `${selectedMonth}-${day.toString().padStart(2, "0")}`;
    const history = mockRegisterHistory[studentId] || [];
    const entry = history.find((h) => h.date === dateStr);
    return entry?.status || null;
  };

  const daysInMonth = getDaysInMonth(selectedMonth);

  if (!classData) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-5 w-5 text-primary" />
                  <SheetTitle className="text-xl">Register History & Tracking</SheetTitle>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {classData.name} • {classData.gradeLevel}
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

            {/* Quick Stats for selected date (list view only) */}
            {viewMode === "list" && (
              <div className="grid grid-cols-5 gap-2 mt-4">
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
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-orange-600">{stats.lateAfterRegister}</div>
                <div className="text-[10px] text-gray-600">L-AR</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-blue-600">{stats.excused}</div>
                <div className="text-[10px] text-gray-600">Excused</div>
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
              <>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-background border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-sm bg-background">
                    Student
                  </th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">
                    Status
                  </th>
                  <th className="p-3 text-center font-semibold text-sm bg-background w-[60px]">
                    History
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const history = mockRegisterHistory[student.id] || [];
                  const entry = history.find((h) => h.date === selectedDate);
                  const hasAmendments = entry?.amendments && entry.amendments.length > 0;

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
                              {getStatusLabel(entry.status)}
                              {hasAmendments && (
                                <AlertCircle className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-muted-foreground">
                            No record
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 relative"
                            onClick={() => handleViewAmendments(student.id)}
                            disabled={!hasAmendments}>
                            <History className="h-4 w-4" />
                            {hasAmendments && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full"></span>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </>
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
                        <th key={day} className="p-2 text-center font-semibold bg-background border min-w-[35px]">
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
                                      status === "P"
                                        ? "bg-green-100 text-green-700"
                                        : status === "L"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : status === "A"
                                        ? "bg-red-100 text-red-700"
                                        : status === "L-AR"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {status}
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

                {/* Legend for grid view */}
                <div className="mt-4 pb-4 flex items-center gap-4 text-xs">
                  <span className="font-semibold">Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-100 text-green-700 font-bold">P</span>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-yellow-100 text-yellow-700 font-bold">L</span>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-700 font-bold">A</span>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-100 text-orange-700 font-bold text-[8px]">L-AR</span>
                    <span>Late After Register</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold">E</span>
                    <span>Excused</span>
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

      {/* Amendment Details Dialog */}
      <Dialog open={showAmendments} onOpenChange={setShowAmendments}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amendment Details</DialogTitle>
            <DialogDescription>
              {selectedStudent &&
                mockStudents.find((s) => s.id === selectedStudent)?.name} - {selectedDate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-auto">
            {selectedStudent &&
            mockRegisterHistory[selectedStudent]?.find((h) => h.date === selectedDate)
              ?.amendments ? (
              mockRegisterHistory[selectedStudent]
                .find((h) => h.date === selectedDate)
                ?.amendments?.map((amendment, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(amendment.originalStatus)}>
                          {getStatusLabel(amendment.originalStatus)}
                        </Badge>
                        <span>→</span>
                        <Badge className={getStatusColor(amendment.newStatus)}>
                          {getStatusLabel(amendment.newStatus)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(amendment.amendedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{amendment.reason}</p>
                    {amendment.reportedBy && (
                      <p className="text-xs text-muted-foreground">
                        Reported by: {amendment.reportedBy}
                      </p>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No amendments recorded</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAmendments(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
