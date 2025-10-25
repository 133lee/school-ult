"use client";

import React, { useState } from "react";
import { Calendar, Printer, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScheduleEntry {
  class: string;
  subject: string;
  teacher: string;
  room: string;
}

const AdminSchedule = () => {
  // Sample schedule data for multiple classes
  const [schedule] = useState<{ [key: string]: ScheduleEntry }>({
    // Grade 9A Schedule
    "9A-Mon-7:00 AM – 7:40 AM": {
      class: "9A",
      subject: "Mathematics",
      teacher: "Mr. Mwanza",
      room: "Room 101",
    },
    "9A-Mon-7:40 AM – 8:20 AM": {
      class: "9A",
      subject: "English",
      teacher: "Mrs. Phiri",
      room: "Room 102",
    },
    "9A-Mon-8:20 AM – 9:00 AM": {
      class: "9A",
      subject: "Science",
      teacher: "Mr. Banda",
      room: "Lab 1",
    },
    "9A-Mon-10:00 AM – 10:40 AM": {
      class: "9A",
      subject: "Physics",
      teacher: "Mr. Mwanza",
      room: "Lab 2",
    },
    "9A-Tues-7:00 AM – 7:40 AM": {
      class: "9A",
      subject: "Mathematics",
      teacher: "Mr. Mwanza",
      room: "Room 101",
    },
    "9A-Tues-10:00 AM – 10:40 AM": {
      class: "9A",
      subject: "English",
      teacher: "Mrs. Phiri",
      room: "Room 102",
    },

    // Grade 10A Schedule
    "10A-Mon-7:00 AM – 7:40 AM": {
      class: "10A",
      subject: "Physics",
      teacher: "Mr. Mwanza",
      room: "Lab 2",
    },
    "10A-Mon-7:40 AM – 8:20 AM": {
      class: "10A",
      subject: "Chemistry",
      teacher: "Ms. Chirwa",
      room: "Lab 3",
    },
    "10A-Tues-7:00 AM – 7:40 AM": {
      class: "10A",
      subject: "Mathematics",
      teacher: "Ms. Chirwa",
      room: "Room 101",
    },
  });

  const [selectedClass, setSelectedClass] = useState("9A");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  // Available classes and teachers
  const classes = ["9A", "9B", "10A", "10B", "11A", "12A"];
  const teachers = [
    "Mr. Mwanza",
    "Mrs. Phiri",
    "Mr. Banda",
    "Ms. Chirwa",
  ];

  // Subject color mapping
  const subjectColors: { [key: string]: string } = {
    Mathematics:
      "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    English:
      "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    Physics:
      "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    Chemistry:
      "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
    Science:
      "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700",
    History:
      "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
    Biology:
      "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700",
  };

  const days = ["Mon", "Tues", "Wed", "Thurs", "Fri"];
  const timeSlots = [
    { time: "7:00 AM – 7:40 AM", short: "7:00-7:40", period: "Period 1", isBreak: false },
    { time: "7:40 AM – 8:20 AM", short: "7:40-8:20", period: "Period 2", isBreak: false },
    { time: "8:20 AM – 9:00 AM", short: "8:20-9:00", period: "Period 3", isBreak: false },
    { time: "9:00 AM – 9:40 AM", short: "9:00-9:40", period: "Period 4", isBreak: false },
    {
      time: "9:40 AM – 10:00 AM",
      short: "9:40-10:00",
      period: "Break",
      isBreak: true,
    },
    { time: "10:00 AM – 10:40 AM", short: "10:00-10:40", period: "Period 5", isBreak: false },
    { time: "10:40 AM – 11:20 AM", short: "10:40-11:20", period: "Period 6", isBreak: false },
    { time: "11:20 AM – 12:00 PM", short: "11:20-12:00", period: "Period 7", isBreak: false },
    { time: "12:00 PM – 12:40 PM", short: "12:00-12:40", period: "Period 8", isBreak: false },
    {
      time: "12:40 PM – 1:00 PM",
      short: "12:40-1:00",
      period: "Lunch",
      isBreak: true,
    },
    { time: "1:00 PM – 1:40 PM", short: "1:00-1:40", period: "Period 9", isBreak: false },
    { time: "1:40 PM – 2:20 PM", short: "1:40-2:20", period: "Period 10", isBreak: false },
  ];

  const dayColors: { [key: string]: string } = {
    Mon: "bg-red-500",
    Tues: "bg-teal-500",
    Wed: "bg-yellow-500",
    Thurs: "bg-blue-500",
    Fri: "bg-gray-500",
  };

  // Filter schedule based on selected filters
  const filteredSchedule = Object.entries(schedule).filter(([key, entry]) => {
    const classMatch = selectedClass === "all" || entry.class === selectedClass;
    const teacherMatch = selectedTeacher === "all" || entry.teacher === selectedTeacher;
    return classMatch && teacherMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">School Schedule</h1>
          <p className="text-muted-foreground text-sm">
            View and manage class schedules across all grades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Label className="text-sm font-medium">Filters:</Label>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="w-48">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Grade {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher} value={teacher}>
                        {teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Viewing: {filteredSchedule.length} slots</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule - Grade {selectedClass}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-background">
              <tr>
                <th className="w-32 p-4 border-r border-b bg-background">
                  <div className="text-left">
                    <div className="font-bold text-sm">Grade {selectedClass}</div>
                    <div className="text-xs text-muted-foreground">
                      Class Schedule
                    </div>
                  </div>
                </th>
                {timeSlots.map((slot) => (
                  <th key={slot.time} className="p-2 min-w-[95px] w-[95px] border-b border-r bg-background">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-primary">
                        {slot.period}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {slot.short}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-b">
                  <td className="p-4 border-r">
                    <div
                      className={`${dayColors[day]} text-white font-semibold py-3 px-6 rounded shadow-md transform -skew-x-12`}
                    >
                      <span className="inline-block transform skew-x-12">
                        {day}
                      </span>
                    </div>
                  </td>
                  {timeSlots.map((slot) => {
                    const key = `${selectedClass}-${day}-${slot.time}`;
                    const entry = schedule[key];

                    return (
                      <td
                        key={slot.time}
                        className={`p-2 border-r transition-all ${
                          slot.isBreak ? "bg-amber-50 dark:bg-amber-900/20" : ""
                        }`}
                      >
                        <div className="min-h-[80px] flex flex-col items-center justify-center p-2">
                          {entry ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-full h-full rounded-lg border-2 p-2 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                      subjectColors[entry.subject] ||
                                      "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                    }`}
                                  >
                                    <span className="text-xs font-bold text-center">
                                      {entry.subject}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground text-center">
                                      {entry.teacher}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-semibold">{entry.subject}</p>
                                    <p className="text-xs">Teacher: {entry.teacher}</p>
                                    <p className="text-xs">Room: {entry.room}</p>
                                    <p className="text-xs">Class: {entry.class}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : slot.isBreak ? (
                            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                              {slot.period}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Subject Color Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(subjectColors).map(([subject, color]) => (
              <div key={subject} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${color}`} />
                <span className="text-xs">{subject}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSchedule;
