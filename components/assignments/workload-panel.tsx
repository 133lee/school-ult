"use client";

import { cn } from "@/lib/utils";
import { AssignmentTeacher, LoadStatus, getLoadStatus, getLoadLabel } from "./types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "lucide-react";

interface WorkloadPanelProps {
  teachers: AssignmentTeacher[];
}

export function WorkloadPanel({ teachers }: WorkloadPanelProps) {
  const sortedTeachers = [...teachers].sort((a, b) => {
    const statusOrder = { overloaded: 0, underutilized: 1, normal: 2 };
    return statusOrder[getLoadStatus(a)] - statusOrder[getLoadStatus(b)];
  });

  const stats = {
    total: teachers.length,
    overloaded: teachers.filter((t) => getLoadStatus(t) === "overloaded").length,
    underutilized: teachers.filter((t) => getLoadStatus(t) === "underutilized").length,
    normal: teachers.filter((t) => getLoadStatus(t) === "normal").length,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Workload Summary
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Normal" value={stats.normal} status="normal" />
          <StatCard label="Overloaded" value={stats.overloaded} status="overloaded" />
          <StatCard label="Under" value={stats.underutilized} status="underutilized" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedTeachers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No teachers available
            </p>
          ) : (
            sortedTeachers.map((teacher) => (
              <TeacherWorkloadCard key={teacher.id} teacher={teacher} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  status: LoadStatus;
}

function StatCard({ label, value, status }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-2 text-center",
        status === "normal" && "bg-green-500/10",
        status === "overloaded" && "bg-destructive/10",
        status === "underutilized" && "bg-yellow-500/10"
      )}
    >
      <div
        className={cn(
          "text-xl font-bold",
          status === "normal" && "text-green-500",
          status === "overloaded" && "text-destructive",
          status === "underutilized" && "text-yellow-500"
        )}
      >
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

interface TeacherWorkloadCardProps {
  teacher: AssignmentTeacher;
}

function TeacherWorkloadCard({ teacher }: TeacherWorkloadCardProps) {
  const status = getLoadStatus(teacher);
  const progressPercent = Math.min(
    (teacher.periodsPerWeek / teacher.maxPeriods) * 100,
    100
  );

  return (
    <div className="bg-card rounded-lg border border-border p-3 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-tight">
              {teacher.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {teacher.totalClasses} classes
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-medium",
            status === "normal" && "border-green-500/30 text-green-600",
            status === "overloaded" && "border-destructive/30 text-destructive",
            status === "underutilized" && "border-yellow-500/30 text-yellow-600"
          )}
        >
          {getLoadLabel(status)}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Periods/week</span>
          <span className="font-medium text-foreground">
            {teacher.periodsPerWeek}/{teacher.maxPeriods}
          </span>
        </div>
        <Progress
          value={progressPercent}
          className={cn(
            "h-1.5",
            status === "overloaded" && "[&>div]:bg-destructive",
            status === "underutilized" && "[&>div]:bg-yellow-500",
            status === "normal" && "[&>div]:bg-green-500"
          )}
        />
      </div>
    </div>
  );
}
