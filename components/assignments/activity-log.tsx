"use client";

import { Clock, UserPlus, RefreshCw, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLogItem } from "./types";

interface ActivityLogProps {
  activities: ActivityLogItem[];
}

const actionIcons = {
  assigned: UserPlus,
  reassigned: RefreshCw,
  unassigned: UserMinus,
};

const actionColors = {
  assigned: "text-green-500 bg-green-500/10",
  reassigned: "text-primary bg-primary/10",
  unassigned: "text-destructive bg-destructive/10",
};

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Activity Log
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recent activity
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = actionIcons[activity.action];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3"
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      actionColors[activity.action]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.teacherName}</span>{" "}
                      <span className="text-muted-foreground">
                        {activity.action === "assigned" && "assigned to"}
                        {activity.action === "reassigned" && "reassigned to"}
                        {activity.action === "unassigned" && "unassigned from"}
                      </span>{" "}
                      <span className="font-medium">{activity.className}</span>
                      <span className="text-muted-foreground"> – </span>
                      <span className="font-medium">{activity.subjectName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
