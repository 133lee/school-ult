"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SessionRegisterSheet } from "./session-register-sheet";
import { RegisterHistorySheet } from "./register-history-sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  ChevronDown,
  GraduationCap,
  ClipboardList,
  BookOpen,
} from "lucide-react";

interface Class {
  id: string;
  classId: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  classTeacher: string;
  totalStudents: number;
  capacity: number;
  subjects: string[];
  schedule: string;
  room: string;
  status: "Active" | "Inactive";
  teachingSubject?: string; // For subject teachers
}

interface ClassDetailsSheetProps {
  classItem: Class | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewStudents?: () => void;
  onViewSchedule?: () => void;
  onManageTeachers?: () => void;
  showActionButtons?: boolean;
  isClassTeacher?: boolean;
}

export function ClassDetailsSheet({
  classItem,
  open,
  onOpenChange,
  onViewStudents,
  onViewSchedule,
  onManageTeachers,
  showActionButtons = true,
  isClassTeacher = false,
}: ClassDetailsSheetProps) {
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [sessionRegisterOpen, setSessionRegisterOpen] = useState(false);
  const [registerHistoryOpen, setRegisterHistoryOpen] = useState(false);

  if (!classItem) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {classItem.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <SheetTitle className="mb-1">{classItem.name}</SheetTitle>
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md whitespace-nowrap">
                  {classItem.gradeLevel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {classItem.classId}
              </p>
            </div>
          </div>
          {showActionButtons && (
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (onViewStudents) {
                      onViewStudents();
                    } else {
                      alert(
                        `View all students in ${classItem.name}\n\nThis would navigate to Students page filtered by class.`
                      );
                    }
                  }}>
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (onViewSchedule) {
                      onViewSchedule();
                    } else {
                      alert(
                        `View schedule for ${classItem.name}\n\nSchedule: ${classItem.schedule}\nRoom: ${classItem.room}`
                      );
                    }
                  }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (onManageTeachers) {
                    onManageTeachers();
                  }
                }}>
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Teachers
              </Button>
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {/* Class Details - Collapsible */}
            <Collapsible
              open={openSection === "details"}
              onOpenChange={(isOpen) =>
                setOpenSection(isOpen ? "details" : null)
              }
              className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Class Details
                </h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Grade Level
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {classItem.gradeLevel}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Academic Year
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {classItem.academicYear}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Room
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {classItem.room}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Capacity
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {classItem.totalStudents}/{classItem.capacity}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground">
                        Schedule
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {classItem.schedule}
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Class Teacher - Collapsible */}
            <Collapsible
              open={openSection === "teacher"}
              onOpenChange={(isOpen) =>
                setOpenSection(isOpen ? "teacher" : null)
              }
              className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Class Teacher
                </h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="px-4 pb-4">
                  <div className="pt-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {classItem.classTeacher}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          View Teachers page for more details
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Subjects - Collapsible */}
            <Collapsible
              open={openSection === "subjects"}
              onOpenChange={(isOpen) =>
                setOpenSection(isOpen ? "subjects" : null)
              }
              className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subjects
                </h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="px-4 pb-4">
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      {classItem.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Total: {classItem.subjects.length} subjects
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        {/* Bottom Action - Register History or Session Register */}
        <div className="p-4 border-t shrink-0 bg-background">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              if (isClassTeacher) {
                setRegisterHistoryOpen(true);
              } else {
                setSessionRegisterOpen(true);
              }
            }}>
            <ClipboardList className="h-5 w-5 mr-2" />
            {isClassTeacher ? "View Register" : "Session Register"}
          </Button>
        </div>
      </SheetContent>

      {/* Register History Sheet (for class teachers) */}
      <RegisterHistorySheet
        open={registerHistoryOpen}
        onOpenChange={setRegisterHistoryOpen}
        classData={classItem ? {
          id: classItem.id,
          name: classItem.name,
          gradeLevel: classItem.gradeLevel,
        } : null}
      />

      {/* Session Register Sheet (for subject teachers) */}
      <SessionRegisterSheet
        open={sessionRegisterOpen}
        onOpenChange={setSessionRegisterOpen}
        classData={classItem ? {
          id: classItem.id,
          name: classItem.name,
          gradeLevel: classItem.gradeLevel,
          teachingSubject: classItem.teachingSubject,
        } : null}
      />
    </Sheet>
  );
}
