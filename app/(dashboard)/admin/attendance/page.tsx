"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  Camera,
  Users,
  UserCheck,
  UserX,
  Calendar as CalendarIcon,
  CheckCheck,
  TrendingUp,
  FileText,
  Grid3x3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Student {
  id: string;
  studentId: string;
  name: string;
  class: string;
  photoUrl: string;
  attendanceStatus: "present" | "absent" | "excused" | null;
  attendanceRate: number;
  email: string;
  phone: string;
}

// Mock student data
const mockStudents: Student[] = [
  {
    id: "1",
    studentId: "STU001",
    name: "John Doe",
    class: "Grade 10A",
    photoUrl: "https://i.pravatar.cc/150?img=1",
    attendanceStatus: null,
    attendanceRate: 95,
    email: "john.doe@school.edu",
    phone: "(555) 123-4567",
  },
  {
    id: "2",
    studentId: "STU002",
    name: "Jane Smith",
    class: "Grade 10A",
    photoUrl: "https://i.pravatar.cc/150?img=2",
    attendanceStatus: null,
    attendanceRate: 88,
    email: "jane.smith@school.edu",
    phone: "(555) 234-5678",
  },
  {
    id: "3",
    studentId: "STU003",
    name: "Mike Johnson",
    class: "Grade 10A",
    photoUrl: "https://i.pravatar.cc/150?img=3",
    attendanceStatus: null,
    attendanceRate: 92,
    email: "mike.johnson@school.edu",
    phone: "(555) 345-6789",
  },
  {
    id: "4",
    studentId: "STU004",
    name: "Sarah Williams",
    class: "Grade 10B",
    photoUrl: "https://i.pravatar.cc/150?img=4",
    attendanceStatus: null,
    attendanceRate: 97,
    email: "sarah.williams@school.edu",
    phone: "(555) 456-7890",
  },
  {
    id: "5",
    studentId: "STU005",
    name: "David Brown",
    class: "Grade 10B",
    photoUrl: "https://i.pravatar.cc/150?img=5",
    attendanceStatus: null,
    attendanceRate: 85,
    email: "david.brown@school.edu",
    phone: "(555) 567-8901",
  },
  {
    id: "6",
    studentId: "STU006",
    name: "Emily Davis",
    class: "Grade 10B",
    photoUrl: "https://i.pravatar.cc/150?img=6",
    attendanceStatus: null,
    attendanceRate: 90,
    email: "emily.davis@school.edu",
    phone: "(555) 678-9012",
  },
];

// Utility function
const getStatusColor = (status: string | null) => {
  switch (status) {
    case "present":
      return "bg-green-100 text-green-700 border-green-200";
    case "absent":
      return "bg-red-100 text-red-700 border-red-200";
    case "excused":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Summary Stats Component
function SummaryStats({ students }: { students: Student[] }) {
  const totalStudents = students.length;
  const presentCount = students.filter(
    (s) => s.attendanceStatus === "present"
  ).length;
  const absentCount = students.filter(
    (s) => s.attendanceStatus === "absent"
  ).length;
  const excusedCount = students.filter(
    (s) => s.attendanceStatus === "excused"
  ).length;
  const attendanceRate =
    totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : "0";

  return (
    <section className="grid grid-cols-2 gap-3">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground mt-1">Active enrolled</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present</CardTitle>
          <UserCheck className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{presentCount}</div>
          <p className="text-xs text-green-600 font-medium mt-1">
            {attendanceRate}% rate
          </p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absent</CardTitle>
          <UserX className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{absentCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Missing today</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Excused</CardTitle>
          <CalendarIcon className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{excusedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">With permission</p>
        </CardContent>
      </Card>
    </section>
  );
}

// Student Details Sheet Component
function StudentDetailsSheet({
  student,
  open,
  onOpenChange,
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!student) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.photoUrl} alt={student.name} />
              <AvatarFallback className="text-lg">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="mb-1">{student.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">
                {student.studentId} • {student.class}
              </p>
              <Badge
                className={`mt-2 ${getStatusColor(student.attendanceStatus)}`}>
                {student.attendanceStatus || "Not Marked"}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <ChartAreaInteractive />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Excellent Attendance</p>
                  <p className="text-xs text-muted-foreground">
                    {student.attendanceRate}% attendance rate - above class
                    average
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Consistent Pattern</p>
                  <p className="text-xs text-muted-foreground">
                    Regular attendance with no extended absences
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Class Comparison</p>
                  <p className="text-xs text-muted-foreground">
                    Performing better than 85% of classmates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Attendance Taking Sheet Component
function AttendanceTakingSheet({
  open,
  onOpenChange,
  students,
  date,
  gradeFilter,
  classFilter,
  onGradeChange,
  onClassChange,
  onMarkAttendance,
  onMarkAllPresent,
  onSubmit,
  onViewReport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  date: Date;
  gradeFilter: string;
  classFilter: string;
  onGradeChange: (grade: string) => void;
  onClassChange: (cls: string) => void;
  onMarkAttendance: (
    id: string,
    status: "present" | "absent" | "excused"
  ) => void;
  onMarkAllPresent: () => void;
  onSubmit: () => void;
  onViewReport: () => void;
}) {
  const presentCount = students.filter(
    (s) => s.attendanceStatus === "present"
  ).length;
  const absentCount = students.filter(
    (s) => s.attendanceStatus === "absent"
  ).length;
  const excusedCount = students.filter(
    (s) => s.attendanceStatus === "excused"
  ).length;
  const notMarkedCount = students.filter((s) => !s.attendanceStatus).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl p-0 overflow-hidden flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Take Attendance</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(date, "EEEE, MMMM d, yyyy")} • {classFilter}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onViewReport}>
              <FileText className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </div>
        </SheetHeader>

        {/* Stats */}
        <div className="px-6 py-4 bg-muted/50 border-b shrink-0">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {presentCount}
              </div>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {absentCount}
              </div>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {excusedCount}
              </div>
              <p className="text-xs text-muted-foreground">Excused</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {notMarkedCount}
              </div>
              <p className="text-xs text-muted-foreground">Unmarked</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b shrink-0">
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={gradeFilter} onValueChange={onGradeChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grade 10">Grade 10</SelectItem>
                <SelectItem value="Grade 11">Grade 11</SelectItem>
                <SelectItem value="Grade 12">Grade 12</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={onClassChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                <SelectItem value="Grade 11B">Grade 11B</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={onMarkAllPresent}
              variant="outline"
              className="w-full md:w-auto">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={student.photoUrl}
                            alt={student.name}
                          />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{student.studentId}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(student.attendanceStatus)}>
                        {student.attendanceStatus || "Not Marked"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant={
                            student.attendanceStatus === "present"
                              ? "default"
                              : "outline"
                          }
                          className={
                            student.attendanceStatus === "present"
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                          onClick={() =>
                            onMarkAttendance(student.id, "present")
                          }>
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            student.attendanceStatus === "absent"
                              ? "default"
                              : "outline"
                          }
                          className={
                            student.attendanceStatus === "absent"
                              ? "bg-red-600 hover:bg-red-700"
                              : ""
                          }
                          onClick={() =>
                            onMarkAttendance(student.id, "absent")
                          }>
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            student.attendanceStatus === "excused"
                              ? "default"
                              : "outline"
                          }
                          className={
                            student.attendanceStatus === "excused"
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : ""
                          }
                          onClick={() =>
                            onMarkAttendance(student.id, "excused")
                          }>
                          Excused
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-6 border-t shrink-0 flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={notMarkedCount > 0}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Submit Attendance{" "}
            {notMarkedCount > 0 && `(${notMarkedCount} unmarked)`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Attendance Report Sheet Component
function AttendanceReportSheet({
  open,
  onOpenChange,
  students,
  date,
  classFilter,
  onAmendments,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  date: Date;
  classFilter: string;
  onAmendments: () => void;
}) {
  const presentCount = students.filter(
    (s) => s.attendanceStatus === "present"
  ).length;
  const absentCount = students.filter(
    (s) => s.attendanceStatus === "absent"
  ).length;
  const excusedCount = students.filter(
    (s) => s.attendanceStatus === "excused"
  ).length;
  const attendanceRate =
    students.length > 0
      ? ((presentCount / students.length) * 100).toFixed(1)
      : "0";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl p-0 overflow-hidden flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <SheetTitle>Attendance Report</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(date, "EEEE, MMMM d, yyyy")} • {classFilter} •{" "}
                {attendanceRate}% Present
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Summary Stats */}
        <div className="px-6 py-6 bg-muted/50 border-b shrink-0">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{presentCount}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <UserX className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{absentCount}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{excusedCount}</p>
                    <p className="text-xs text-muted-foreground">Excused</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <h3 className="font-semibold mb-4">Student List</h3>
          <div className="overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-20 bg-background">
                <TableRow>
                  <TableHead className="w-12 bg-background">#</TableHead>
                  <TableHead className="bg-background">Student</TableHead>
                  <TableHead className="bg-background">Student ID</TableHead>
                  <TableHead className="bg-background">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={student.photoUrl}
                            alt={student.name}
                          />
                          <AvatarFallback className="text-xs">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {student.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{student.studentId}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(student.attendanceStatus)}>
                        {student.attendanceStatus || "Not Marked"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t shrink-0 flex justify-between">
          <Button variant="outline" onClick={onAmendments}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Make Amendments
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Detailed Attendance Per Class Sheet Component
function DetailedAttendanceSheet({
  open,
  onOpenChange,
  classFilter,
  teacherFilter,
  dateFrom,
  dateTo,
  onClassChange,
  onTeacherChange,
  onDateFromChange,
  onDateToChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classFilter: string;
  teacherFilter: string;
  dateFrom: Date;
  dateTo: Date;
  onClassChange: (cls: string) => void;
  onTeacherChange: (teacher: string) => void;
  onDateFromChange: (date: Date) => void;
  onDateToChange: (date: Date) => void;
}) {
  const [gridViewOpen, setGridViewOpen] = useState(false);
  // Mock attendance data per student
  const attendanceRecords = mockStudents.map((student) => ({
    ...student,
    attendanceStatus: ["present", "absent", "excused", "present", "present"][
      Math.floor(Math.random() * 5)
    ] as "present" | "absent" | "excused",
    markedBy: ["Ms. Johnson", "Mr. Smith", "Ms. Davis"][
      Math.floor(Math.random() * 3)
    ],
    markedAt: new Date().toISOString(),
  }));

  const presentCount = attendanceRecords.filter(
    (s) => s.attendanceStatus === "present"
  ).length;
  const absentCount = attendanceRecords.filter(
    (s) => s.attendanceStatus === "absent"
  ).length;
  const excusedCount = attendanceRecords.filter(
    (s) => s.attendanceStatus === "excused"
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[80vw] p-0 overflow-hidden flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">Detailed Attendance View</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review attendance records taken by teachers
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </SheetHeader>

        {/* Filters Row */}
        <div className="px-6 py-4 border-b shrink-0 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={classFilter} onValueChange={onClassChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class 9A">Class 9A</SelectItem>
                <SelectItem value="Class 9B">Class 9B</SelectItem>
                <SelectItem value="Class 10A">Class 10A</SelectItem>
                <SelectItem value="Class 10B">Class 10B</SelectItem>
                <SelectItem value="Class 11A">Class 11A</SelectItem>
              </SelectContent>
            </Select>

            <Select value={teacherFilter} onValueChange={onTeacherChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Teachers">All Teachers</SelectItem>
                <SelectItem value="Ms. Johnson">Ms. Johnson</SelectItem>
                <SelectItem value="Mr. Smith">Mr. Smith</SelectItem>
                <SelectItem value="Ms. Davis">Ms. Davis</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateFrom, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(d) => d && onDateFromChange(d)}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="default"
              onClick={() => setGridViewOpen(true)}
              className="w-full">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Attendance Grid
            </Button>
          </div>
        </div>

        {/* Stats Row - Inline Badges */}
        <div className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold mr-2">Quick Stats:</span>
            <Badge variant="outline" className="gap-1.5">
              <span className="text-xs font-medium">Total:</span>
              <span className="text-sm font-bold">{attendanceRecords.length}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-green-50 text-green-700 border-green-200">
              <UserCheck className="h-3 w-3" />
              <span className="text-sm font-bold">{presentCount}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-red-50 text-red-700 border-red-200">
              <UserX className="h-3 w-3" />
              <span className="text-sm font-bold">{absentCount}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
              <CalendarIcon className="h-3 w-3" />
              <span className="text-sm font-bold">{excusedCount}</span>
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-background border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-sm bg-background">#</th>
                  <th className="p-3 text-left font-semibold text-sm bg-background">Student</th>
                  <th className="p-3 text-left font-semibold text-sm bg-background">Student ID</th>
                  <th className="p-3 text-left font-semibold text-sm bg-background">Gender</th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">Status</th>
                  <th className="p-3 text-left font-semibold text-sm bg-background">Marked By</th>
                  <th className="p-3 text-left font-semibold text-sm bg-background">Time</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-muted/70 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/30"
                    }`}>
                    <td className="p-3">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.photoUrl} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.class}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{student.studentId}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">
                        {index % 2 === 0 ? "Male" : "Female"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={getStatusColor(student.attendanceStatus)}>
                        {student.attendanceStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{student.markedBy}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(student.markedAt), "hh:mm a")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t shrink-0 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </SheetContent>

      {/* Attendance Grid Sheet */}
      <Sheet open={gridViewOpen} onOpenChange={setGridViewOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[95vw] p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl">
                  Attendance Grid - {classFilter}
                  {teacherFilter !== "All Teachers" && ` - ${teacherFilter}`}
                </SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Visual grid view of attendance for {format(dateFrom, "MMM d, yyyy")}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Grid
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-auto p-6">
            {/* Grid Table */}
            <div className="overflow-auto">
              <table className="w-full border-collapse border">
                <thead className="bg-muted/50 sticky top-0 z-20">
                  <tr>
                    <th className="border p-2 text-left font-semibold text-sm sticky left-0 bg-muted/50 z-30">
                      Student
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 1), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 2), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 3), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 4), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 5), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 8), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 9), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm">
                      {format(new Date(2024, 0, 10), "MMM d")}
                    </th>
                    <th className="border p-2 text-center font-semibold text-sm bg-muted sticky right-0">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.slice(0, 10).map((student, studentIndex) => {
                    // Generate random attendance pattern for grid
                    const attendancePattern = Array.from({ length: 8 }, (_, i) => {
                      const rand = Math.random();
                      if (rand > 0.8) return "absent";
                      if (rand > 0.7) return "excused";
                      return "present";
                    });
                    const totalPresent = attendancePattern.filter((s) => s === "present").length;

                    return (
                      <tr key={student.id}>
                        <td className="border p-2 sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photoUrl} alt={student.name} />
                              <AvatarFallback className="text-xs">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium whitespace-nowrap">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        {attendancePattern.map((status, dayIndex) => (
                          <td
                            key={dayIndex}
                            className={`border p-2 text-center ${
                              status === "present"
                                ? "bg-green-100"
                                : status === "absent"
                                ? "bg-red-100"
                                : "bg-blue-100"
                            }`}>
                            <span className="text-xs font-semibold">
                              {status === "present" ? "P" : status === "absent" ? "A" : "E"}
                            </span>
                          </td>
                        ))}
                        <td className="border p-2 text-center bg-muted font-semibold sticky right-0">
                          {totalPresent}/8
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 justify-center pb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 border rounded flex items-center justify-center">
                  <span className="text-xs font-semibold">P</span>
                </div>
                <span className="text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 border rounded flex items-center justify-center">
                  <span className="text-xs font-semibold">A</span>
                </div>
                <span className="text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 border rounded flex items-center justify-center">
                  <span className="text-xs font-semibold">E</span>
                </div>
                <span className="text-sm">Excused</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Sheet>
  );
}

// Main Component
export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [attendanceSheetOpen, setAttendanceSheetOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [detailedAttendanceSheetOpen, setDetailedAttendanceSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sheetGradeFilter, setSheetGradeFilter] = useState("Grade 10");
  const [sheetClassFilter, setSheetClassFilter] = useState("Grade 10A");
  const [date, setDate] = useState<Date>(new Date());
  const [submittedAttendance, setSubmittedAttendance] = useState<Student[]>([]);

  // Detailed attendance sheet filters
  const [detailedClassFilter, setDetailedClassFilter] = useState("Class 9A");
  const [detailedTeacherFilter, setDetailedTeacherFilter] = useState("All Teachers");
  const [detailedDateFrom, setDetailedDateFrom] = useState<Date>(new Date());
  const [detailedDateTo, setDetailedDateTo] = useState<Date>(new Date());

  // Filter students for main view
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade =
      gradeFilter === "all" || student.class.includes(gradeFilter);
    const matchesClass = classFilter === "all" || student.class === classFilter;
    return matchesSearch && matchesGrade && matchesClass;
  });

  // Filter students for attendance sheet
  const sheetFilteredStudents = students.filter((student) => {
    return student.class === sheetClassFilter;
  });

  // Mark attendance
  const markAttendance = (
    studentId: string,
    status: "present" | "absent" | "excused"
  ) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, attendanceStatus: status } : s
      )
    );
  };

  // Mark all present in sheet
  const markAllPresentInSheet = () => {
    setStudents(
      students.map((s) =>
        sheetFilteredStudents.some((fs) => fs.id === s.id)
          ? { ...s, attendanceStatus: "present" }
          : s
      )
    );
  };

  // Submit attendance
  const submitAttendance = () => {
    const attendanceList = sheetFilteredStudents.map((s) => ({
      ...s,
      submittedAt: new Date().toISOString(),
    }));
    setSubmittedAttendance(attendanceList);
    setAttendanceSheetOpen(false);
    setReportSheetOpen(true);
  };

  // Handle amendments
  const handleAmendments = () => {
    setReportSheetOpen(false);
    setAttendanceSheetOpen(true);
  };

  // Handle view report
  const handleViewReport = () => {
    if (sheetFilteredStudents.length > 0) {
      setSubmittedAttendance(sheetFilteredStudents);
      setAttendanceSheetOpen(false);
      setReportSheetOpen(true);
    }
  };

  // Handle grade change in sheet
  const handleSheetGradeChange = (grade: string) => {
    setSheetGradeFilter(grade);
    setSheetClassFilter(`${grade}A`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground text-sm">
            Mark and track student attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-[240px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="Grade 10">Grade 10</SelectItem>
                <SelectItem value="Grade 11">Grade 11</SelectItem>
                <SelectItem value="Grade 12">Grade 12</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                <SelectItem value="Grade 11B">Grade 11B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Row: Chart + Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ChartAreaInteractive />
        </div>
        <div className="md:col-span-1">
          <SummaryStats students={filteredStudents} />
        </div>
      </div>

      {/* View Attendance Per Class Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setDetailedAttendanceSheetOpen(true)}
          className="min-w-[280px]">
          <FileText className="h-5 w-5 mr-2" />
          View Attendance Per Class
        </Button>
      </div>

      {/* Take Attendance Section */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Ready to Take Attendance?
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Select a class and mark attendance manually or use facial
              recognition for automated tracking
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={() => setAttendanceSheetOpen(true)}
              className="min-w-[180px]">
              <CheckCheck className="h-5 w-5 mr-2" />
              Take Attendance
            </Button>
            <Button size="lg" variant="outline" className="min-w-[180px]">
              <Camera className="h-5 w-5 mr-2" />
              Facial Recognition
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Details Sheet */}
      <StudentDetailsSheet
        student={selectedStudent}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
      />

      {/* Attendance Taking Sheet */}
      <AttendanceTakingSheet
        open={attendanceSheetOpen}
        onOpenChange={setAttendanceSheetOpen}
        students={sheetFilteredStudents}
        date={date}
        gradeFilter={sheetGradeFilter}
        classFilter={sheetClassFilter}
        onGradeChange={handleSheetGradeChange}
        onClassChange={setSheetClassFilter}
        onMarkAttendance={markAttendance}
        onMarkAllPresent={markAllPresentInSheet}
        onSubmit={submitAttendance}
        onViewReport={handleViewReport}
      />

      {/* Attendance Report Sheet */}
      <AttendanceReportSheet
        open={reportSheetOpen}
        onOpenChange={setReportSheetOpen}
        students={submittedAttendance}
        date={date}
        classFilter={sheetClassFilter}
        onAmendments={handleAmendments}
      />

      {/* Detailed Attendance Per Class Sheet */}
      <DetailedAttendanceSheet
        open={detailedAttendanceSheetOpen}
        onOpenChange={setDetailedAttendanceSheetOpen}
        classFilter={detailedClassFilter}
        teacherFilter={detailedTeacherFilter}
        dateFrom={detailedDateFrom}
        dateTo={detailedDateTo}
        onClassChange={setDetailedClassFilter}
        onTeacherChange={setDetailedTeacherFilter}
        onDateFromChange={setDetailedDateFrom}
        onDateToChange={setDetailedDateTo}
      />
    </div>
  );
}
