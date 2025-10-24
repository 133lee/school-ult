"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  attendance: boolean[];
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

export default function DetailedAttendancePage({
  params,
}: {
  params: { classId: string };
}) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"attendance" | "statistics">(
    "attendance"
  );

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Mock class data - would come from API based on classId
  const classData = {
    id: params.classId,
    name: "Class 9A",
    gradeLevel: "Grade 9",
  };

  // Mock student data - would come from API
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      name: "Alex Smith",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 || i === 9 || i === 10 || i === 11 ? false : i < 19
      ),
    },
    {
      id: "2",
      name: "Alice Wonder",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 ? false : i < 19
      ),
    },
    {
      id: "3",
      name: "Brinda Sloan",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 5 || i === 6 || i === 16 ? false : i < 19
      ),
    },
    {
      id: "4",
      name: "Britney Spears",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 ? false : i < 19
      ),
    },
    {
      id: "5",
      name: "Calvin Klein",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 || i === 16 ? false : i < 19
      ),
    },
    {
      id: "6",
      name: "Christina Perri",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 || i === 7 ? false : i < 19
      ),
    },
    {
      id: "7",
      name: "Diana Chase",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 ? false : i < 19
      ),
    },
    {
      id: "8",
      name: "Emily Clarke",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 || i === 9 || i === 10 || i === 11 || i === 15 ? false : i < 19
      ),
    },
    {
      id: "9",
      name: "Floyd Williams",
      attendance: Array.from({ length: daysInMonth }, (_, i) =>
        i === 6 ? false : i < 19
      ),
    },
  ]);

  const toggleAttendance = (studentId: string, dayIndex: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              attendance: student.attendance.map((att, idx) =>
                idx === dayIndex ? !att : att
              ),
            }
          : student
      )
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const calculateStats = (student: Student) => {
    const total = student.attendance.length;
    const present = student.attendance.filter((a) => a).length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0";
    return { present, absent, percentage };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col space-y-2">
            <h1 className="text-xl font-bold">
              Detailed Attendance - {classData.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {classData.gradeLevel} • Monthly attendance tracking
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {/* Tabs */}
          <div className="flex items-center gap-8 mb-6 border-b">
            <button
              className={`pb-3 border-b-2 font-medium transition-colors ${
                activeTab === "attendance"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("attendance")}>
              Attendance
            </button>
            <button
              className={`pb-3 border-b-2 font-medium transition-colors ${
                activeTab === "statistics"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("statistics")}>
              Statistics
            </button>
          </div>

          {activeTab === "attendance" ? (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[120px] text-center">
                    {months[currentMonth]} {currentYear}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Attendance Table */}
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm sticky left-0 bg-background border-r z-10">
                          Names
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className="p-3 font-normal text-muted-foreground text-sm min-w-[40px]">
                            {day.toString().padStart(2, "0")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-t hover:bg-muted/50">
                          <td className="p-3 font-medium sticky left-0 bg-background border-r z-10">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{student.name}</span>
                            </div>
                          </td>
                          {days.map((day, dayIndex) => (
                            <td key={day} className="p-3 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  toggleAttendance(student.id, dayIndex)
                                }>
                                {dayIndex < student.attendance.length ? (
                                  student.attendance[dayIndex] ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-400" />
                                  )
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </Button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </>
          ) : (
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="space-y-4">
                {students.map((student) => {
                  const stats = calculateStats(student);
                  return (
                    <Card key={student.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
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
                              <p className="font-semibold text-sm">
                                {student.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {months[currentMonth]} {currentYear}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-bold text-green-600">
                                {stats.present}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Present
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-red-600">
                                {stats.absent}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Absent
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-blue-600">
                                {stats.percentage}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Rate
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
