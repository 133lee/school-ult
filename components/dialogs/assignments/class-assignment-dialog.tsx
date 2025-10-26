"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Search, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ClassAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: {
    id: string;
    name: string;
    gradeLevel: string;
    subjects: string[];
  } | null;
  availableTeachers: Array<{
    id: string;
    name: string;
    subject: string;
    primarySubject?: string;
    secondarySubject?: string;
  }>;
  onAssign: (
    teacherId: string,
    classId: string,
    subject: string
  ) => Promise<void>;
  currentAssignments?: Array<{
    teacherId: string;
    teacherName: string;
    subject: string;
  }>;
}

export function ClassAssignmentDialog({
  open,
  onOpenChange,
  classItem,
  availableTeachers,
  onAssign,
  currentAssignments = [],
}: ClassAssignmentDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [newAssignments, setNewAssignments] = useState<
    Array<{ teacherId: string; teacherName: string; subject: string }>
  >([...currentAssignments]);

  // Filter teachers by search
  const filteredTeachers = useMemo(() => {
    return availableTeachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableTeachers, searchQuery]);

  // Get teachers that can teach the selected subject
  const teachersForSubject = useMemo(() => {
    if (!selectedSubject) return filteredTeachers;
    return filteredTeachers.filter((teacher) => {
      const teacherSubjects = [
        teacher.primarySubject || teacher.subject,
        teacher.secondarySubject,
      ].filter(Boolean);
      return teacherSubjects.includes(selectedSubject);
    });
  }, [selectedSubject, filteredTeachers]);

  // Get already assigned subjects for this teacher
  const assignedSubjectsForTeacher = useMemo(() => {
    if (!selectedSubject) return [];
    return newAssignments
      .filter((a) => a.subject === selectedSubject)
      .map((a) => a.teacherId);
  }, [newAssignments, selectedSubject]);

  const handleAssignTeacher = (teacher: any) => {
    if (!selectedSubject) {
      toast.error("Please select a subject first");
      return;
    }

    // Check if already assigned
    if (
      newAssignments.some(
        (a) => a.teacherId === teacher.id && a.subject === selectedSubject
      )
    ) {
      toast.error("This teacher is already assigned to this subject");
      return;
    }

    const newAssignment = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject: selectedSubject,
    };

    setNewAssignments([...newAssignments, newAssignment]);
    toast.success(`${teacher.name} assigned to ${selectedSubject}`);
    setSearchQuery("");
  };

  const handleRemoveAssignment = (index: number) => {
    const removed = newAssignments[index];
    setNewAssignments(newAssignments.filter((_, i) => i !== index));
    toast.success(`Assignment removed: ${removed.teacherName} - ${removed.subject}`);
  };

  const handleSave = async () => {
    if (!classItem) return;

    setIsLoading(true);
    try {
      // For now, just toast the changes (backend will be implemented later)
      if (newAssignments.length > 0) {
        // In real implementation, call API for each new assignment
        for (const assignment of newAssignments) {
          if (
            !currentAssignments.some(
              (ca) =>
                ca.teacherId === assignment.teacherId &&
                ca.subject === assignment.subject
            )
          ) {
            await onAssign(assignment.teacherId, classItem.id, assignment.subject);
          }
        }
      }

      // Remove assignments that were deleted
      for (const currentAssignment of currentAssignments) {
        if (
          !newAssignments.some(
            (na) =>
              na.teacherId === currentAssignment.teacherId &&
              na.subject === currentAssignment.subject
          )
        ) {
          // Call unassign API (to be implemented)
        }
      }

      toast.success(`Updated assignments for ${classItem.name}`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save assignments");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!classItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[90vw] !max-w-[1400px] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Teachers</DialogTitle>
          <DialogDescription>
            Assign teachers to subjects in {classItem.name}
          </DialogDescription>
        </DialogHeader>

        {/* Two Column Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
          {/* Column 1: Add New Assignment */}
          <div className="border rounded-lg p-4 space-y-4 overflow-hidden flex flex-col">
            <h4 className="font-semibold text-sm shrink-0">Add New Assignment</h4>

            <div className="space-y-4 overflow-y-auto flex-1">
              {/* Subject and Search in Same Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="subject-select">Subject *</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject-select">
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {classItem.subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher-search">Search</Label>
                  <Input
                    id="teacher-search"
                    placeholder="Teacher name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Teacher Selection - Tap to Assign */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Available Teachers</Label>
                <ScrollArea className="h-[350px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {teachersForSubject.length > 0 ? (
                      teachersForSubject.map((teacher) => (
                        <button
                          key={teacher.id}
                          onClick={() => handleAssignTeacher(teacher)}
                          disabled={
                            !selectedSubject ||
                            assignedSubjectsForTeacher.includes(teacher.id)
                          }
                          className={`w-full text-left p-3 rounded-md transition-colors text-sm border ${
                            assignedSubjectsForTeacher.includes(teacher.id)
                              ? "bg-green-50 border-green-200 text-muted-foreground cursor-not-allowed"
                              : !selectedSubject
                                ? "bg-gray-50 border-muted text-muted-foreground cursor-not-allowed"
                                : "bg-white hover:bg-primary/10 border-muted hover:border-primary cursor-pointer hover:shadow-sm"
                          }`}
                        >
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-xs opacity-75">
                            {[
                              teacher.primarySubject || teacher.subject,
                              teacher.secondarySubject,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        </button>
                      ))
                    ) : selectedSubject ? (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No teachers available for {selectedSubject}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        Select a subject first to see available teachers
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Column 2: Two Rows - Equal Height */}
          <div className="flex flex-col gap-4 overflow-hidden h-full">
            {/* Row 1: Class Info */}
            <Card className="bg-muted/50 shrink-0">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{classItem.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {classItem.gradeLevel}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {classItem.subjects.map((subject) => (
                      <Badge key={subject} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Row 2: Assignments List - Full Height */}
            <div className="border rounded-lg p-4 overflow-hidden flex flex-col flex-1">
              <h4 className="font-semibold text-sm mb-3 shrink-0">
                Assignments ({newAssignments.length})
              </h4>

              {newAssignments.length > 0 ? (
                <ScrollArea className="flex-1 border rounded-lg p-2">
                  <div className="space-y-2">
                    {newAssignments.map((assignment, index) => (
                      <div
                        key={`${assignment.teacherId}-${assignment.subject}`}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {assignment.teacherName}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {assignment.subject}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveAssignment(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Empty className="flex-1 border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <AlertCircle className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle>No assignments yet</EmptyTitle>
                    <EmptyDescription>
                      Select a subject and tap a teacher to assign
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || newAssignments.length === 0}
          >
            {isLoading ? "Saving..." : "Save Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
