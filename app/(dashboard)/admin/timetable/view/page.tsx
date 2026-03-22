"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Filter, Download } from "lucide-react";
import { toast } from "sonner";

interface TimetableSlot {
  id: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  class: {
    id: string;
    name: string;
    grade: {
      name: string;
    };
  };
  room?: {
    id: string;
    name: string;
    code?: string;
  };
}

interface Class {
  id: string;
  name: string;
  gradeName: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface Room {
  id: string;
  name: string;
  code?: string;
}

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};

export default function TimetableViewPage() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [filterType, setFilterType] = useState<"class" | "teacher" | "room" | "all">("all");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (classes.length > 0 || teachers.length > 0 || rooms.length > 0) {
      fetchTimetable();
    }
  }, [filterType, selectedClass, selectedTeacher, selectedRoom, selectedDay]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      // Fetch timetable data
      const timetableResponse = await fetch("/api/admin/timetable/view", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!timetableResponse.ok) throw new Error("Failed to fetch timetable");

      const timetableData = await timetableResponse.json();
      setSlots(timetableData.slots || []);

      // Extract unique classes, teachers, and rooms
      const uniqueClasses = new Map<string, Class>();
      const uniqueTeachers = new Map<string, Teacher>();
      const uniqueRooms = new Map<string, Room>();

      timetableData.slots?.forEach((slot: TimetableSlot) => {
        uniqueClasses.set(slot.class.id, {
          id: slot.class.id,
          name: slot.class.name,
          gradeName: slot.class.grade.name,
        });

        uniqueTeachers.set(slot.teacher.id, {
          id: slot.teacher.id,
          firstName: slot.teacher.firstName,
          lastName: slot.teacher.lastName,
        });

        if (slot.room) {
          uniqueRooms.set(slot.room.id, {
            id: slot.room.id,
            name: slot.room.name,
            code: slot.room.code,
          });
        }
      });

      setClasses(Array.from(uniqueClasses.values()));
      setTeachers(Array.from(uniqueTeachers.values()));
      setRooms(Array.from(uniqueRooms.values()));
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams();

      if (filterType === "class" && selectedClass) {
        params.append("classId", selectedClass);
      } else if (filterType === "teacher" && selectedTeacher) {
        params.append("teacherId", selectedTeacher);
      } else if (filterType === "room" && selectedRoom) {
        params.append("roomId", selectedRoom);
      }

      if (selectedDay !== "all") {
        params.append("dayOfWeek", selectedDay);
      }

      const response = await fetch(
        `/api/admin/timetable/view?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch timetable");

      const data = await response.json();
      setSlots(data.slots || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSlots = () => {
    return slots.filter((slot) => {
      if (selectedDay !== "all" && slot.dayOfWeek !== selectedDay) return false;
      return true;
    });
  };

  const groupSlotsByDay = () => {
    const filteredSlots = getFilteredSlots();
    const grouped: Record<string, TimetableSlot[]> = {};

    DAYS_OF_WEEK.forEach((day) => {
      grouped[day] = filteredSlots
        .filter((slot) => slot.dayOfWeek === day)
        .sort((a, b) => a.periodNumber - b.periodNumber);
    });

    return grouped;
  };

  const getMaxPeriods = () => {
    const filteredSlots = getFilteredSlots();
    return filteredSlots.length > 0
      ? Math.max(...filteredSlots.map((slot) => slot.periodNumber))
      : 8;
  };

  const getSlotForDayAndPeriod = (day: string, period: number) => {
    const groupedSlots = groupSlotsByDay();
    return groupedSlots[day]?.find((slot) => slot.periodNumber === period);
  };

  const handleExportPDF = async () => {
    // Build query params based on filter type
    const params = new URLSearchParams();
    let filename = "timetable";

    if (filterType === "class") {
      if (!selectedClass) {
        toast.error("Please select a class to export");
        return;
      }
      params.append("classId", selectedClass);
      const className = classes.find(c => c.id === selectedClass);
      filename = `timetable_${className?.gradeName}_${className?.name}`;
    } else if (filterType === "teacher") {
      if (!selectedTeacher) {
        toast.error("Please select a teacher to export");
        return;
      }
      params.append("teacherId", selectedTeacher);
      const teacher = teachers.find(t => t.id === selectedTeacher);
      filename = `timetable_${teacher?.firstName}_${teacher?.lastName}`;
    } else if (filterType === "all") {
      // Export all classes - will generate a ZIP file
      toast.info("Exporting all classes... This may take a moment");
      params.append("exportAll", "true");
      filename = "all_timetables";
    } else {
      toast.error("PDF export not supported for this view");
      return;
    }

    setExporting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/admin/timetable/export-pdf?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export PDF");
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Check content type for ZIP vs PDF
      const contentType = response.headers.get("Content-Type");
      a.download = contentType?.includes("zip") ? `${filename}.zip` : `${filename}.pdf`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Timetable exported successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const groupedSlots = groupSlotsByDay();
  const maxPeriods = getMaxPeriods();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timetable View</h1>
          <p className="text-muted-foreground">
            View and manage the complete school timetable
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={
            exporting ||
            (filterType === "class" && !selectedClass) ||
            (filterType === "teacher" && !selectedTeacher) ||
            filterType === "room"
          }
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {filterType === "all" ? "Export All Classes" : "Export PDF"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter timetable by class, teacher, room, or day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">View By</label>
              <Select
                value={filterType}
                onValueChange={(value: any) => {
                  setFilterType(value);
                  setSelectedClass("");
                  setSelectedTeacher("");
                  setSelectedRoom("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Slots</SelectItem>
                  <SelectItem value="class">By Class</SelectItem>
                  <SelectItem value="teacher">By Teacher</SelectItem>
                  <SelectItem value="room">By Room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterType === "class" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.gradeName} - {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterType === "teacher" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Teacher</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterType === "room" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Room</label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} {room.code && `(${room.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Day</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {DAY_LABELS[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timetable
            {filterType === "class" && selectedClass && (
              <Badge variant="secondary">
                {classes.find((c) => c.id === selectedClass)?.name}
              </Badge>
            )}
            {filterType === "teacher" && selectedTeacher && (
              <Badge variant="secondary">
                {teachers.find((t) => t.id === selectedTeacher)?.firstName}{" "}
                {teachers.find((t) => t.id === selectedTeacher)?.lastName}
              </Badge>
            )}
            {filterType === "room" && selectedRoom && (
              <Badge variant="secondary">
                {rooms.find((r) => r.id === selectedRoom)?.name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Showing {getFilteredSlots().length} slot
            {getFilteredSlots().length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getFilteredSlots().length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No timetable slots found. Generate a timetable to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Period</TableHead>
                    <TableHead className="w-24">Time</TableHead>
                    {DAYS_OF_WEEK.map((day) => (
                      <TableHead key={day} className="min-w-[200px]">
                        {DAY_LABELS[day]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(
                    (period) => {
                      const sampleSlot = getSlotForDayAndPeriod(DAYS_OF_WEEK[0], period);

                      return (
                        <TableRow key={period}>
                          <TableCell className="font-medium text-center">
                            {period}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {sampleSlot?.startTime || "-"}
                            <br />
                            {sampleSlot?.endTime || "-"}
                          </TableCell>
                          {DAYS_OF_WEEK.map((day) => {
                            const slot = getSlotForDayAndPeriod(day, period);

                            if (!slot) {
                              return (
                                <TableCell key={day} className="bg-muted/30">
                                  <div className="text-xs text-muted-foreground text-center">
                                    -
                                  </div>
                                </TableCell>
                              );
                            }

                            return (
                              <TableCell key={day}>
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">
                                    {slot.subject.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {slot.teacher.firstName} {slot.teacher.lastName}
                                  </div>
                                  <div className="flex gap-1 flex-wrap">
                                    {filterType !== "class" && (
                                      <Badge variant="outline" className="text-xs">
                                        {slot.class.name}
                                      </Badge>
                                    )}
                                    {slot.room && filterType !== "room" && (
                                      <Badge variant="secondary" className="text-xs">
                                        {slot.room.name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
