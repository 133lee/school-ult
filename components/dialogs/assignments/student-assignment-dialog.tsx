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
import { AlertCircle, Trash2, Users, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableClasses: Array<{
    id: string;
    name: string;
    gradeLevel: string;
    capacity: number;
  }>;
  availableStudents: Array<{
    id: string;
    name: string;
    studentId: string;
    gradeLevel: string;
    status: string;
  }>;
  onAssign: (
    studentId: string,
    classId: string
  ) => Promise<void>;
  currentAssignments?: Record<string, Array<{ studentId: string; studentName: string }>>;
}

export function StudentAssignmentDialog({
  open,
  onOpenChange,
  availableClasses,
  availableStudents,
  onAssign,
  currentAssignments = {},
}: StudentAssignmentDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get all unique grades
  const availableGrades = useMemo(() => {
    const grades = new Set(availableClasses.map((cls) => cls.gradeLevel));
    return Array.from(grades).sort();
  }, [availableClasses]);

  // Get classes filtered by selected grade
  const classesForGrade = useMemo(() => {
    if (!selectedGradeFilter) return availableClasses;
    return availableClasses.filter((cls) => cls.gradeLevel === selectedGradeFilter);
  }, [availableClasses, selectedGradeFilter]);

  // Get the currently selected class
  const selectedClass = useMemo(() => {
    return availableClasses.find((cls) => cls.id === selectedClassId);
  }, [selectedClassId, availableClasses]);

  // Set default grade and class on dialog open
  React.useEffect(() => {
    if (open && !selectedGradeFilter && availableGrades.length > 0) {
      const firstGrade = availableGrades[0];
      setSelectedGradeFilter(firstGrade);
    }
  }, [open, selectedGradeFilter, availableGrades]);

  // Set default class when grade changes
  React.useEffect(() => {
    if (selectedGradeFilter && classesForGrade.length > 0 && !selectedClassId) {
      setSelectedClassId(classesForGrade[0].id);
    }
  }, [selectedGradeFilter, classesForGrade, selectedClassId]);

  // Get students for the selected class's grade level
  const studentsForGrade = useMemo(() => {
    if (!selectedClass) return [];
    return availableStudents.filter(
      (student) => student.gradeLevel === selectedClass.gradeLevel
    );
  }, [selectedClass, availableStudents]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return studentsForGrade.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentsForGrade, searchQuery]);

  // Get already assigned students for this class
  const assignedStudentIds = useMemo(() => {
    if (!selectedClass) return [];
    return (currentAssignments[selectedClass.id] || []).map(
      (a) => a.studentId
    );
  }, [selectedClass, currentAssignments]);

  // Track new assignments for this class
  const [newAssignments, setNewAssignments] = useState<
    Record<string, Array<{ studentId: string; studentName: string }>>
  >({});

  // Get assignments for current class
  const classAssignments = useMemo(() => {
    if (!selectedClass) return [];
    return newAssignments[selectedClass.id] || [];
  }, [selectedClass, newAssignments]);

  const handleToggleStudent = (student: any, isChecked: boolean) => {
    if (!selectedClass) return;

    const classKey = selectedClass.id;

    if (isChecked) {
      // Add student
      const existing = newAssignments[classKey] || [];
      const newAssignment = {
        studentId: student.id,
        studentName: student.name,
      };

      if (
        !existing.some((a) => a.studentId === student.id) &&
        !assignedStudentIds.includes(student.id)
      ) {
        setNewAssignments({
          ...newAssignments,
          [classKey]: [...existing, newAssignment],
        });
        toast.success(`${student.name} assigned to ${selectedClass.name}`);
      }
    } else {
      // Remove student
      const existing = newAssignments[classKey] || [];
      const removed = existing.find((a) => a.studentId === student.id);
      setNewAssignments({
        ...newAssignments,
        [classKey]: existing.filter((a) => a.studentId !== student.id),
      });
      if (removed) {
        toast.success(`${removed.studentName} removed from ${selectedClass.name}`);
      }
    }
  };

  const handleRemoveAssignment = (studentId: string) => {
    if (!selectedClass) return;

    const classKey = selectedClass.id;
    const existing = newAssignments[classKey] || [];
    const removed = existing.find((a) => a.studentId === studentId);

    setNewAssignments({
      ...newAssignments,
      [classKey]: existing.filter((a) => a.studentId !== studentId),
    });

    if (removed) {
      toast.success(`${removed.studentName} removed`);
    }
  };

  const handleSave = async () => {
    if (!selectedClass || Object.keys(newAssignments).length === 0) {
      toast.error("No assignments to save");
      return;
    }

    setIsLoading(true);
    try {
      // Save all assignments
      for (const [classId, assignments] of Object.entries(newAssignments)) {
        for (const assignment of assignments) {
          if (
            !assignedStudentIds.includes(assignment.studentId) &&
            classId === selectedClass.id
          ) {
            await onAssign(assignment.studentId, classId);
          }
        }
      }

      toast.success("Student assignments saved successfully");
      onOpenChange(false);
      setNewAssignments({});
    } catch (error) {
      toast.error("Failed to save assignments");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!availableClasses.length) {
    return null;
  }

  const capacityUsed =
    (classAssignments.length || 0) + (assignedStudentIds.length || 0);
  const capacityPercent = selectedClass
    ? Math.round((capacityUsed / selectedClass.capacity) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[90vw] !max-w-[1400px] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Students to Classes</DialogTitle>
          <DialogDescription>
            Select a class and assign students based on their grade level
          </DialogDescription>
        </DialogHeader>

        {/* Two Column Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
          {/* Column 1: Student Search & Selection */}
          <div className="border rounded-lg p-4 space-y-4 overflow-hidden flex flex-col">
            <h4 className="font-semibold text-sm shrink-0">Available Students</h4>

            <div className="space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label htmlFor="student-search">Search</Label>
                <Input
                  id="student-search"
                  placeholder="Name or Student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Student List with Checkboxes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Students ({filteredStudents.length})
                </Label>
                {filteredStudents.length > 0 ? (
                  <ScrollArea className="h-[350px] border rounded-lg p-2">
                    <div className="space-y-2">
                      {filteredStudents.map((student) => {
                        const isAssigned =
                          assignedStudentIds.includes(student.id) ||
                          classAssignments.some((a) => a.studentId === student.id);

                        return (
                          <label
                            key={student.id}
                            className={`flex items-center gap-3 p-3 rounded-md transition-colors text-sm border cursor-pointer ${
                              isAssigned
                                ? "bg-green-50 border-green-200"
                                : "bg-white hover:bg-gray-50 border-muted hover:border-primary"
                            }`}
                          >
                            <Checkbox
                              checked={isAssigned}
                              onCheckedChange={(isChecked) =>
                                handleToggleStudent(student, isChecked as boolean)
                              }
                              disabled={
                                capacityUsed >= (selectedClass?.capacity || 0) &&
                                !isAssigned
                              }
                            />
                            <div className="flex-1">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs opacity-75">
                                {student.studentId} • {student.gradeLevel}
                              </div>
                            </div>
                            {isAssigned && (
                              <Badge variant="secondary" className="text-xs">
                                ✓
                              </Badge>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 border rounded-lg p-4 flex items-center justify-center text-center">
                    <div className="text-sm text-muted-foreground">
                      {selectedClass
                        ? `No students found for ${selectedClass.gradeLevel}`
                        : "Select a class first"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Two Rows - Equal Height */}
          <div className="flex flex-col gap-4 overflow-hidden h-full">
            {/* Row 1: Grade & Class Selector & Info */}
            <Card className="bg-muted/50 shrink-0">
              <CardContent className="p-4 space-y-4">
                {/* Grade Filter & Class Selector - Same Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Grade Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="grade-select">Grade Level *</Label>
                    <Select value={selectedGradeFilter} onValueChange={(grade) => {
                      setSelectedGradeFilter(grade);
                      setSelectedClassId(""); // Reset class selection when grade changes
                    }}>
                      <SelectTrigger id="grade-select">
                        <SelectValue placeholder="Choose grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGrades.map((grade) => {
                          const classCountForGrade = availableClasses.filter(
                            (cls) => cls.gradeLevel === grade
                          ).length;
                          return (
                            <SelectItem key={grade} value={grade}>
                              {grade} ({classCountForGrade})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class Selector - Disabled until grade is selected */}
                  <div className="space-y-2">
                    <Label htmlFor="class-select">Class *</Label>
                    <Select
                      value={selectedClassId}
                      onValueChange={setSelectedClassId}
                      disabled={!selectedGradeFilter}
                    >
                      <SelectTrigger id="class-select" className={!selectedGradeFilter ? "opacity-50 cursor-not-allowed" : ""}>
                        <SelectValue placeholder={selectedGradeFilter ? "Choose class" : "Select grade first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classesForGrade.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedClass && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-xs font-medium">Capacity</Label>
                      <span className="text-xs font-semibold">
                        {capacityUsed}/{selectedClass.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          capacityPercent > 90
                            ? "bg-red-500"
                            : capacityPercent > 75
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {capacityPercent}% full
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Row 2: Assigned Students - Full Height */}
            <div className="border rounded-lg p-4 overflow-hidden flex flex-col flex-1">
              <h4 className="font-semibold text-sm mb-3 shrink-0">
                Assigned Students ({classAssignments.length})
              </h4>

              {classAssignments.length > 0 ? (
                <ScrollArea className="flex-1 border rounded-lg p-2">
                  <div className="space-y-2">
                    {classAssignments.map((assignment) => (
                      <div
                        key={assignment.studentId}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="font-medium text-sm">
                          {assignment.studentName}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveAssignment(assignment.studentId)}
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
                      <Users className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle>No students assigned yet</EmptyTitle>
                    <EmptyDescription>
                      Select students from the left to assign them to this class
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
            disabled={isLoading || Object.keys(newAssignments).length === 0}
          >
            {isLoading ? "Saving..." : "Save Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
