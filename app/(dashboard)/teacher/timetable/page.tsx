"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { StatsCard } from "@/components/hod/assessments/stats-card";

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

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};

export default function TeacherTimetablePage() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [teacherName, setTeacherName] = useState<string>("");

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/teacher/timetable", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch timetable");

      const result = await response.json();

      // API returns { success: true, data: {...} } - must check success flag
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch timetable");
      }

      const data = result.data;
      setSlots(data.slots || []);

      if (data.teacher) {
        setTeacherName(`${data.teacher.firstName} ${data.teacher.lastName}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load your timetable");
    } finally {
      setLoading(false);
    }
  };

  const groupSlotsByDay = () => {
    const grouped: Record<string, TimetableSlot[]> = {};

    DAYS_OF_WEEK.forEach((day) => {
      grouped[day] = slots
        .filter((slot) => slot.dayOfWeek === day)
        .sort((a, b) => a.periodNumber - b.periodNumber);
    });

    return grouped;
  };

  const getMaxPeriods = () => {
    return slots.length > 0
      ? Math.max(...slots.map((slot) => slot.periodNumber))
      : 8;
  };

  const getSlotForDayAndPeriod = (day: string, period: number) => {
    const groupedSlots = groupSlotsByDay();
    return groupedSlots[day]?.find((slot) => slot.periodNumber === period);
  };

  const getWeeklyStats = () => {
    const uniqueClasses = new Set(slots.map((slot) => slot.class.id));
    const uniqueSubjects = new Set(slots.map((slot) => slot.subject.id));

    return {
      totalSlots: slots.length,
      uniqueClasses: uniqueClasses.size,
      uniqueSubjects: uniqueSubjects.size,
    };
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
  const stats = getWeeklyStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Timetable</h1>
        <p className="text-muted-foreground">
          Your personal teaching schedule
          {teacherName && ` - ${teacherName}`}
        </p>
      </div>

      {/* Weekly Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Classes"
          value={stats.totalSlots}
          icon={Calendar}
          variant="info"
        />
        <StatsCard
          title="Classes Teaching"
          value={stats.uniqueClasses}
          icon={BookOpen}
          variant="success"
        />
        <StatsCard
          title="Subjects Assigned"
          value={stats.uniqueSubjects}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Your complete teaching schedule for the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No timetable available yet. Please contact your administrator.
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
                      <TableHead key={day} className="min-w-[180px]">
                        {DAY_LABELS[day]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(
                    (period) => {
                      const sampleSlot = getSlotForDayAndPeriod(DAYS_OF_WEEK[0], period) ||
                        getSlotForDayAndPeriod(DAYS_OF_WEEK[1], period) ||
                        getSlotForDayAndPeriod(DAYS_OF_WEEK[2], period);

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
                                    Free Period
                                  </div>
                                </TableCell>
                              );
                            }

                            return (
                              <TableCell key={day} className="bg-primary/5">
                                <div className="space-y-1.5">
                                  <div className="font-semibold text-sm">
                                    {slot.subject.name}
                                  </div>
                                  <div className="flex gap-1 flex-wrap">
                                    <Badge variant="default" className="text-xs">
                                      {slot.class.grade.name} - {slot.class.name}
                                    </Badge>
                                    {slot.room && (
                                      <Badge variant="outline" className="text-xs">
                                        {slot.room.code || slot.room.name}
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

      {/* Day-by-Day View (Mobile Friendly) */}
      <div className="grid gap-4 md:hidden">
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = groupedSlots[day];

          if (!daySlots || daySlots.length === 0) return null;

          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-lg">{DAY_LABELS[day]}</CardTitle>
                <CardDescription>
                  {daySlots.length} class{daySlots.length !== 1 ? "es" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm font-medium">Period {slot.periodNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {slot.startTime}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold">{slot.subject.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {slot.class.grade.name} - {slot.class.name}
                      </div>
                      {slot.room && (
                        <div className="text-xs text-muted-foreground">
                          Room: {slot.room.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
