"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Phone, Mail, ChevronDown } from "lucide-react";

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  year: number;
  photoUrl: string;
  className: string;
  grade: string;
  gender: string;
  dateOfBirth: string;
  religion: string;
  bloodGroup: string;
  address: string;
  father: string;
  fatherPhone: string;
  mother: string;
  motherPhone: string;
  status: "Active" | "Inactive" | "Suspended";
}

interface StudentDetailsSheetProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewPerformance?: () => void;
  showPerformanceButton?: boolean;
}

export function StudentDetailsSheet({
  student,
  open,
  onOpenChange,
  onViewPerformance,
  showPerformanceButton = true,
}: StudentDetailsSheetProps) {
  const [openSection, setOpenSection] = useState<string | null>("about");

  if (!student) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
        {/* Header with Grade Badge */}
        <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.photoUrl} alt={student.name} />
              <AvatarFallback className="text-lg">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <SheetTitle className="mb-1">{student.name}</SheetTitle>
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md whitespace-nowrap">
                  {student.className}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {student.studentId}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => (window.location.href = `tel:${student.phone}`)}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => (window.location.href = `mailto:${student.email}`)}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {/* About - Collapsible */}
            <Collapsible
              open={openSection === "about"}
              onOpenChange={(isOpen) => setOpenSection(isOpen ? "about" : null)}
              className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  About
                </h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Date of Birth
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {student.dateOfBirth}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Age
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {new Date().getFullYear() -
                          parseInt(student.dateOfBirth.split("-")[2])}{" "}
                        years
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground">
                        Address
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {student.address}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {student.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Email
                      </label>
                      <p className="text-sm font-medium mt-0.5 break-all">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Parent / Guardian - Collapsible */}
            <Collapsible
              open={openSection === "guardian"}
              onOpenChange={(isOpen) =>
                setOpenSection(isOpen ? "guardian" : null)
              }
              className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parent / Guardian
                </h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground">
                        Name
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {student.father || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {student.fatherPhone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Relationship
                      </label>
                      <p className="text-sm font-medium mt-0.5">Father</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Emergency Contact - Collapsible */}
            <Collapsible
              open={openSection === "emergency"}
              onOpenChange={(isOpen) =>
                setOpenSection(isOpen ? "emergency" : null)
              }
              className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Emergency Contact
                </h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground">
                        Name
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {student.mother || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-sm font-medium mt-0.5">
                        {student.motherPhone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Relationship
                      </label>
                      <p className="text-sm font-medium mt-0.5">Mother</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        {/* Fixed Button at Bottom */}
        {showPerformanceButton && onViewPerformance && (
          <div className="p-2 pt-2 border-t shrink-0 bg-background mb-6">
            <Button onClick={onViewPerformance} className="w-full shadow-sm">
              View Academic Performance
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
