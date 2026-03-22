"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CalendarCheck } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Attendance</h1>
          <p className="text-muted-foreground text-sm">
            Mark and manage student attendance
          </p>
        </div>
      </div>

      {/* Coming Soon Empty State */}
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <CalendarCheck className="h-12 w-12" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Coming Soon</EmptyTitle>
              <EmptyDescription>
                Attendance management features are currently under development
                and will be available soon.
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
