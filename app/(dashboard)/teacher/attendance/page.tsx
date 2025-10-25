"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CalendarIcon,
  Save,
  Download,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "SICK";

interface Student {
  id: string;
  name: string;
  studentId: string;
  photoUrl: string;
  gender: string;
  attendance: AttendanceStatus | null;
}

const students: Student[] = [
  {
    id: "1",
    name: "John Doe",
    studentId: "STU001",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    gender: "Male",
    attendance: null,
  },
  {
    id: "2",
    name: "Julie Von",
    studentId: "STU002",
    photoUrl: "https://i.pravatar.cc/150?img=5",
    gender: "Female",
    attendance: null,
  },
  {
    id: "3",
    name: "Jocelyn Walker",
    studentId: "STU003",
    photoUrl: "https://i.pravatar.cc/150?img=9",
    gender: "Female",
    attendance: null,
  },
  {
    id: "4",
    name: "Jaiden Zulauf",
    studentId: "STU004",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    gender: "Male",
    attendance: null,
  },
  {
    id: "5",
    name: "Morris Mayert",
    studentId: "STU006",
    photoUrl: "https://i.pravatar.cc/150?img=13",
    gender: "Male",
    attendance: null,
  },
  {
    id: "6",
    name: "Ronny Kemmer",
    studentId: "STU007",
    photoUrl: "https://i.pravatar.cc/150?img=15",
    gender: "Male",
    attendance: null,
  },
  {
    id: "7",
    name: "Bianka Tromp",
    studentId: "STU008",
    photoUrl: "https://i.pravatar.cc/150?img=25",
    gender: "Female",
    attendance: null,
  },
  {
    id: "8",
    name: "Gregg Quigley",
    studentId: "STU009",
    photoUrl: "https://i.pravatar.cc/150?img=33",
    gender: "Male",
    attendance: null,
  },
];

export default function TeacherAttendancePage() {
  const [selectedClass, setSelectedClass] = useState("Class 9A");
  const [date, setDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Student[]>(students);
  const [hasChanges, setHasChanges] = useState(false);

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, attendance: status } : student
      )
    );
    setHasChanges(true);
  };

  const markAllPresent = () => {
    setAttendanceData((prev) =>
      prev.map((student) => ({ ...student, attendance: "PRESENT" }))
    );
    setHasChanges(true);
  };

  const saveAttendance = () => {
    console.log("Saving attendance:", {
      class: selectedClass,
      date: format(date, "yyyy-MM-dd"),
      attendance: attendanceData,
    });
    toast.success("Attendance saved successfully!");
    setHasChanges(false);
  };

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter((s) => s.attendance === "PRESENT").length,
    absent: attendanceData.filter((s) => s.attendance === "ABSENT").length,
    late: attendanceData.filter((s) => s.attendance === "LATE").length,
    excused: attendanceData.filter((s) => s.attendance === "EXCUSED").length,
    sick: attendanceData.filter((s) => s.attendance === "SICK").length,
    notMarked: attendanceData.filter((s) => s.attendance === null).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Mark Attendance</h1>
          <p className="text-muted-foreground text-sm">
            Record daily attendance for your classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success("Exporting attendance report...");
              // In production, this would generate CSV/Excel export
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader className="space-y-4">
          {/* Filters Row */}
          <div className="flex items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class 9A">Class 9A - Mathematics</SelectItem>
                <SelectItem value="Class 10A">Class 10A - Mathematics</SelectItem>
                <SelectItem value="Class 11A">Class 11A - Advanced Math</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={markAllPresent}>
              Mark All Present
            </Button>
          </div>

          {/* Stats Row - Inline Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base mr-2">Quick Stats:</CardTitle>
            <Badge variant="outline" className="gap-1.5">
              <span className="text-xs font-medium">Total:</span>
              <span className="text-sm font-bold">{stats.total}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.present}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-red-50 text-red-700 border-red-200">
              <XCircle className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.absent}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.late}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
              <AlertCircle className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.excused}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-purple-50 text-purple-700 border-purple-200">
              <AlertCircle className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.sick}</span>
            </Badge>
            {stats.notMarked > 0 && (
              <Badge variant="outline" className="gap-1.5 bg-gray-50 text-gray-700 border-gray-300">
                <span className="text-xs">Not Marked:</span>
                <span className="text-sm font-bold">{stats.notMarked}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {/* Table */}
          <div className="overflow-auto flex-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-background border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-sm bg-background">Student</th>
                  <th className="p-3 text-left font-semibold text-sm bg-background">Gender</th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">Present</th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">Absent</th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">Late</th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">Excused</th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">Sick</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-muted/70 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/30"
                    }`}>
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
                          <p className="text-xs text-muted-foreground">
                            {student.studentId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium">{student.gender}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant={student.attendance === "PRESENT" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-8 h-8 p-0",
                          student.attendance === "PRESENT" && "bg-green-600 hover:bg-green-700"
                        )}
                        onClick={() => updateAttendance(student.id, "PRESENT")}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant={student.attendance === "ABSENT" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-8 h-8 p-0",
                          student.attendance === "ABSENT" && "bg-red-600 hover:bg-red-700"
                        )}
                        onClick={() => updateAttendance(student.id, "ABSENT")}>
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant={student.attendance === "LATE" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-8 h-8 p-0",
                          student.attendance === "LATE" && "bg-yellow-600 hover:bg-yellow-700"
                        )}
                        onClick={() => updateAttendance(student.id, "LATE")}>
                        <Clock className="h-3 w-3" />
                      </Button>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant={student.attendance === "EXCUSED" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-8 h-8 p-0",
                          student.attendance === "EXCUSED" && "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={() => updateAttendance(student.id, "EXCUSED")}>
                        <AlertCircle className="h-3 w-3" />
                      </Button>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant={student.attendance === "SICK" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-8 h-8 p-0",
                          student.attendance === "SICK" && "bg-purple-600 hover:bg-purple-700"
                        )}
                        onClick={() => updateAttendance(student.id, "SICK")}>
                        <AlertCircle className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t">
            {stats.notMarked > 0 ? (
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">
                  {stats.notMarked} student{stats.notMarked !== 1 ? "s" : ""} not
                  yet marked. Please mark all students before saving.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-medium">
                  All students marked. Ready to save.
                </p>
              </div>
            )}
            <Button
              size="sm"
              onClick={saveAttendance}
              disabled={!hasChanges || stats.notMarked > 0}
              className="min-w-[140px]">
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
