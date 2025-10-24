"use client";

import React, { useState, useMemo } from "react";
import { Filter, Maximize2, Minimize2, Printer, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScheduleEntry {
  class: string;
  subject: string;
  room: string;
  notes: string;
}

const TeacherSchedule = () => {
  // Teacher info
  const teacherName = "Mr. John Smith";
  const teacherSubjects = ["Mathematics", "Physics"];

  // Sample schedule data for realistic view (updated to match new time slots)
  const [schedule, setSchedule] = useState<{ [key: string]: ScheduleEntry }>({
    "Mon-7:00 AM – 7:40 AM": {
      class: "9A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Chapter 5: Algebra",
    },
    "Mon-7:40 AM – 8:20 AM": {
      class: "10A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Trigonometry basics",
    },
    "Mon-10:00 AM – 10:40 AM": {
      class: "9A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Practice problems",
    },
    "Mon-1:00 PM – 1:40 PM": {
      class: "11A",
      subject: "Physics",
      room: "Lab 2",
      notes: "Newton's Laws practical",
    },

    "Tues-7:00 AM – 7:40 AM": {
      class: "10A",
      subject: "Physics",
      room: "Lab 2",
      notes: "Mechanics experiment",
    },
    "Tues-10:00 AM – 10:40 AM": {
      class: "9A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Geometry",
    },
    "Tues-1:00 PM – 1:40 PM": {
      class: "11A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Calculus introduction",
    },

    "Wed-7:00 AM – 7:40 AM": {
      class: "9A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Quiz preparation",
    },
    "Wed-7:40 AM – 8:20 AM": {
      class: "10A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Statistics",
    },
    "Wed-11:20 AM – 12:00 PM": {
      class: "11A",
      subject: "Physics",
      room: "Lab 2",
      notes: "Wave motion",
    },
    "Wed-1:00 PM – 1:40 PM": {
      class: "9A",
      subject: "Physics",
      room: "Lab 2",
      notes: "Force and motion",
    },

    "Thurs-7:00 AM – 7:40 AM": {
      class: "11A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Derivatives",
    },
    "Thurs-10:00 AM – 10:40 AM": {
      class: "10A",
      subject: "Physics",
      room: "Lab 2",
      notes: "Energy conservation",
    },
    "Thurs-1:00 PM – 1:40 PM": {
      class: "9A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Review session",
    },

    "Fri-7:00 AM – 7:40 AM": {
      class: "9A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Weekly test",
    },
    "Fri-7:40 AM – 8:20 AM": {
      class: "10A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Weekly test",
    },
    "Fri-11:20 AM – 12:00 PM": {
      class: "11A",
      subject: "Mathematics",
      room: "Room 101",
      notes: "Weekly test",
    },
  });

  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [viewMode, setViewMode] = useState<"minimal" | "full">("full");
  const [selectedDay, setSelectedDay] = useState("Mon");

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    day: string;
    time: string;
  } | null>(null);
  const [formData, setFormData] = useState<ScheduleEntry>({
    class: "",
    subject: "",
    room: "",
    notes: "",
  });

  // Mock data for classes and subjects
  const classes = ["9A", "10A", "11A"];
  const subjects = [
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "History",
    "Biology",
  ];

  // Subject color mapping for visual coding
  const subjectColors: { [key: string]: string } = {
    Mathematics:
      "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    English:
      "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    Physics:
      "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    Chemistry:
      "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
    History:
      "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
    Biology:
      "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700",
  };

  const days = ["Mon", "Tues", "Wed", "Thurs", "Fri"];
  const timeSlots = [
    { time: "7:00 AM – 7:40 AM", short: "7:00-7:40", period: "Period 1" },
    { time: "7:40 AM – 8:20 AM", short: "7:40-8:20", period: "Period 2" },
    { time: "8:20 AM – 9:00 AM", short: "8:20-9:00", period: "Period 3" },
    { time: "9:00 AM – 9:40 AM", short: "9:00-9:40", period: "Period 4" },
    {
      time: "9:40 AM – 10:00 AM",
      short: "9:40-10:00",
      period: "Break",
      isBreak: true,
    },
    { time: "10:00 AM – 10:40 AM", short: "10:00-10:40", period: "Period 5" },
    { time: "10:40 AM – 11:20 AM", short: "10:40-11:20", period: "Period 6" },
    { time: "11:20 AM – 12:00 PM", short: "11:20-12:00", period: "Period 7" },
    { time: "12:00 PM – 12:40 PM", short: "12:00-12:40", period: "Period 8" },
    {
      time: "12:40 PM – 1:00 PM",
      short: "12:40-1:00",
      period: "Lunch",
      isBreak: true,
    },
    { time: "1:00 PM – 1:40 PM", short: "1:00-1:40", period: "Period 9" },
    { time: "1:40 PM – 2:20 PM", short: "1:40-2:20", period: "Period 10" },
  ];

  const dayColors: { [key: string]: string } = {
    Mon: "bg-red-500",
    Tues: "bg-teal-500",
    Wed: "bg-yellow-500",
    Thurs: "bg-blue-500",
    Fri: "bg-gray-500",
  };

  // Get current time indicator
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const currentDay = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"][
      now.getDay()
    ];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if it's a school day
    if (currentDay === "Sun") return null;

    // Find matching time slot
    for (const slot of timeSlots) {
      const [start] = slot.time.split(" – ");
      const [startTime, startPeriod] = start.split(" ");
      const [startHour, startMinute] = startTime.split(":").map(Number);

      let hour24 = startHour;
      if (startPeriod === "PM" && startHour !== 12) hour24 += 12;
      if (startPeriod === "AM" && startHour === 12) hour24 = 0;

      if (currentHour === hour24 && currentMinute >= startMinute) {
        return { day: currentDay, time: slot.time };
      }
    }

    return null;
  };

  const currentSlot = getCurrentTimeSlot();

  const handleCellClick = (day: string, time: string) => {
    const key = `${day}-${time}`;
    const existing = schedule[key];

    setEditingCell({ day, time });
    setFormData(existing || { class: "", subject: "", room: "", notes: "" });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingCell) return;

    const key = `${editingCell.day}-${editingCell.time}`;

    // If all fields are empty, remove the entry
    if (
      !formData.class &&
      !formData.subject &&
      !formData.room &&
      !formData.notes
    ) {
      const newSchedule = { ...schedule };
      delete newSchedule[key];
      setSchedule(newSchedule);
    } else {
      setSchedule((prev) => ({
        ...prev,
        [key]: formData,
      }));
    }

    setIsDialogOpen(false);
    setEditingCell(null);
  };

  const handleDelete = () => {
    if (!editingCell) return;

    const key = `${editingCell.day}-${editingCell.time}`;
    const newSchedule = { ...schedule };
    delete newSchedule[key];
    setSchedule(newSchedule);

    setIsDialogOpen(false);
    setEditingCell(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const daysToShow = viewMode === "minimal" ? [selectedDay] : days;

  // Filter schedule based on selected class and subject
  const filteredSchedule = useMemo(() => {
    const filtered: { [key: string]: ScheduleEntry } = {};

    Object.entries(schedule).forEach(([key, entry]) => {
      const matchesClass =
        selectedClass === "all" || entry.class === selectedClass;
      const matchesSubject =
        selectedSubject === "all" || entry.subject === selectedSubject;

      if (matchesClass && matchesSubject) {
        filtered[key] = entry;
      }
    });

    return filtered;
  }, [schedule, selectedClass, selectedSubject]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-start justify-between mt-2">
          <div className="flex flex-col space-y-2">
            <h1 className="text-xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground text-sm">
              View and manage your weekly teaching schedule
            </p>
          </div>

          {/* Filters on the right */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filters:</Label>
            </div>
            <div className="w-30">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="flex flex-col h-[calc(100vh-12rem)]">
          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-background">
                  {/* First header row - Print button and View toggle buttons */}
                  <tr>
                    <th className="w-48 p-4 bg-background" colSpan={1}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrint}
                          className="gap-2">
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                      </div>
                    </th>
                    <th
                      colSpan={timeSlots.length}
                      className="p-4 bg-background">
                      <div className="flex items-center justify-end gap-2">
                        {/* View toggle buttons */}
                        {viewMode === "minimal" && (
                          <Select
                            value={selectedDay}
                            onValueChange={setSelectedDay}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {days.map((day) => (
                                <SelectItem key={day} value={day}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          variant={
                            viewMode === "minimal" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setViewMode("minimal")}
                          className="gap-2">
                          <Minimize2 className="h-4 w-4" />
                          Single Day
                        </Button>
                        <Button
                          variant={viewMode === "full" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("full")}
                          className="gap-2">
                          <Maximize2 className="h-4 w-4" />
                          Full Week
                        </Button>
                      </div>
                    </th>
                  </tr>
                  {/* Second header row - Teacher name and time slots */}
                  <tr>
                    <th className="w-48 p-4 border-t bg-background">
                      <div className="text-left">
                        <div className="font-bold text-sm">{teacherName}</div>
                        <div className="text-xs text-muted-foreground">
                          {teacherSubjects.join(" • ")}
                        </div>
                      </div>
                    </th>
                    {timeSlots.map((slot) => (
                      <th
                        key={slot.time}
                        className="p-2 min-w-[95px] w-[95px] border-t bg-background">
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
                  {daysToShow.map((day) => (
                    <tr key={day} className="border-t border-border">
                      <td className="p-4 border-r border-border">
                        <div
                          className={`${dayColors[day]} text-white font-semibold py-3 px-6 rounded shadow-md transform -skew-x-12`}>
                          <span className="inline-block transform skew-x-12">
                            {day}
                          </span>
                        </div>
                      </td>
                      {timeSlots.map((slot) => {
                        const key = `${day}-${slot.time}`;
                        const entry = filteredSchedule[key];
                        const isCurrentSlot =
                          currentSlot?.day === day &&
                          currentSlot?.time === slot.time;
                        const isBreak = slot.isBreak || false;

                        return (
                          <Tooltip key={slot.time}>
                            <TooltipTrigger asChild>
                              <td
                                className={`p-2 border-r border-border cursor-pointer transition-all relative ${
                                  isCurrentSlot
                                    ? "ring-2 ring-primary ring-inset"
                                    : ""
                                } ${
                                  entry
                                    ? "hover:opacity-80"
                                    : "hover:bg-muted/50"
                                } ${isBreak ? "bg-muted/20" : ""}`}
                                onClick={() =>
                                  !isBreak && handleCellClick(day, slot.time)
                                }>
                                {isCurrentSlot && (
                                  <div className="absolute top-1 right-1">
                                    <Clock className="h-3 w-3 text-primary animate-pulse" />
                                  </div>
                                )}
                                <div className="min-h-[80px] flex flex-col items-center justify-center p-2 gap-1">
                                  {entry ? (
                                    <div
                                      className={`w-full h-full rounded-lg border-2 p-2 flex flex-col items-center justify-center gap-1 ${
                                        subjectColors[entry.subject] ||
                                        "bg-gray-100 border-gray-300"
                                      }`}>
                                      <span className="text-xs font-bold text-center">
                                        {entry.class}
                                      </span>
                                      <span className="text-[10px] font-medium text-center">
                                        {entry.subject}
                                      </span>
                                    </div>
                                  ) : isBreak ? (
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {slot.period}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      Free Period
                                    </span>
                                  )}
                                </div>
                              </td>
                            </TooltipTrigger>
                            {entry && (
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-semibold">
                                    {entry.class} - {entry.subject}
                                  </p>
                                  <p className="text-xs">{entry.room}</p>
                                  {entry.notes && (
                                    <p className="text-xs text-muted-foreground">
                                      {entry.notes}
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Schedule</DialogTitle>
              <DialogDescription>
                {editingCell &&
                  `${editingCell.day} - ${
                    timeSlots.find((s) => s.time === editingCell.time)?.period
                  }`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={formData.class}
                  onValueChange={(value) =>
                    setFormData({ ...formData, class: value })
                  }>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  placeholder="e.g., Room 101, Lab 2"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes or topics for this class"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              {schedule[`${editingCell?.day}-${editingCell?.time}`] && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="mr-auto">
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default TeacherSchedule;
