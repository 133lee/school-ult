"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHODAuth } from "@/hooks/useHODAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Clock, Download, Save, X, AlertCircle, Table2, List } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  studentId: string;
  name: string;
  photoUrl: string;
  gender: string;
}

interface GradeData {
  score: number | null;
  percentage: number | null;
  grade: string;
  comments: string;
  status: "present" | "absent" | "excused" | null;
}

interface StudentGrades {
  [studentId: string]: {
    CAT1: GradeData;
    MID: GradeData;
    EOT: GradeData;
  };
}

const students: Student[] = [
  {
    id: "1",
    studentId: "STU001",
    name: "John Doe",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    gender: "Male",
  },
  {
    id: "2",
    studentId: "STU002",
    name: "Julie Von",
    photoUrl: "https://i.pravatar.cc/150?img=5",
    gender: "Female",
  },
  {
    id: "3",
    studentId: "STU003",
    name: "Jocelyn Walker",
    photoUrl: "https://i.pravatar.cc/150?img=9",
    gender: "Female",
  },
  {
    id: "4",
    studentId: "STU004",
    name: "Jaiden Zulauf",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    gender: "Male",
  },
  {
    id: "5",
    studentId: "STU006",
    name: "Morris Mayert",
    photoUrl: "https://i.pravatar.cc/150?img=13",
    gender: "Male",
  },
  {
    id: "6",
    studentId: "STU007",
    name: "Ronny Kemmer",
    photoUrl: "https://i.pravatar.cc/150?img=15",
    gender: "Male",
  },
];

const ASSESSMENT_TYPES = ["CAT1", "MID", "EOT"] as const;
type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

const MAX_SCORES: Record<AssessmentType, number> = {
  CAT1: 100,
  MID: 100,
  EOT: 100,
};

// Helper function to calculate grade from percentage
function calculateGrade(percentage: number | null): string {
  if (percentage === null) return "-";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "E";
}

// Helper function to calculate percentage
function calculatePercentage(score: number | null, maxScore: number): number | null {
  if (score === null || score < 0) return null;
  return Math.round((score / maxScore) * 100);
}

export default function HODGradesPage() {
  const { currentHOD, isLoading } = useHODAuth();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeTab, setActiveTab] = useState<AssessmentType>("CAT1");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedClass, setSelectedClass] = useState("Class 9A");
  const [grades, setGrades] = useState<StudentGrades>(() => {
    // Initialize with empty grades
    const initialGrades: StudentGrades = {};
    students.forEach((student) => {
      initialGrades[student.id] = {
        CAT1: { score: null, percentage: null, grade: "-", comments: "", status: null },
        MID: { score: null, percentage: null, grade: "-", comments: "", status: null },
        EOT: { score: null, percentage: null, grade: "-", comments: "", status: null },
      };
    });
    return initialGrades;
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mock data for subjects and classes (would come from API in production)
  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];
  const classes = ["Class 9A", "Class 9B", "Class 10A", "Class 10B", "Class 11A"];

  // Auto-save function with debouncing
  const autoSave = useCallback(() => {
    setSaveStatus("saving");

    // Simulate API call
    setTimeout(() => {
      setSaveStatus("saved");
      toast.success("Grades saved successfully", {
        duration: 2000,
      });

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }, 500);
  }, []);

  // Debounced save
  const debouncedSave = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      autoSave();
    }, 1500); // 1.5 second debounce

    setSaveTimeout(timeout);
  }, [saveTimeout, autoSave]);

  // Handle score change
  const handleScoreChange = (studentId: string, assessmentType: AssessmentType, value: string) => {
    const score = value === "" ? null : parseFloat(value);
    const maxScore = MAX_SCORES[assessmentType];

    // Validate score
    if (score !== null && (score < 0 || score > maxScore)) {
      toast.error(`Score must be between 0 and ${maxScore}`);
      return;
    }

    const percentage = calculatePercentage(score, maxScore);
    const grade = calculateGrade(percentage);

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentType]: {
          ...prev[studentId][assessmentType],
          score,
          percentage,
          grade,
          // Clear status when entering a score
          status: score !== null ? null : prev[studentId][assessmentType].status,
        },
      },
    }));

    debouncedSave();
  };

  // Handle comments change
  const handleCommentsChange = (studentId: string, assessmentType: AssessmentType, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentType]: {
          ...prev[studentId][assessmentType],
          comments: value,
        },
      },
    }));

    debouncedSave();
  };

  // Handle status change
  const handleStatusChange = (studentId: string, assessmentType: AssessmentType, status: "present" | "absent" | "excused" | null) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentType]: {
          ...prev[studentId][assessmentType],
          status,
          // Clear score, percentage, and grade when marking as absent/excused
          score: status !== null ? null : prev[studentId][assessmentType].score,
          percentage: status !== null ? null : prev[studentId][assessmentType].percentage,
          grade: status !== null ? "-" : prev[studentId][assessmentType].grade,
        },
      },
    }));

    debouncedSave();
  };

  // Calculate progress for each assessment type
  const getAssessmentProgress = (assessmentType: AssessmentType): number => {
    const completed = students.filter(
      (student) => grades[student.id][assessmentType].score !== null
    ).length;
    return students.length > 0 ? Math.round((completed / students.length) * 100) : 0;
  };

  // Export grades
  const handleExport = () => {
    toast.success("Exporting grades...", { duration: 2000 });
    // Implement export functionality here
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentHOD) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Gradebook ({currentHOD.department})</h1>
          <p className="text-muted-foreground text-sm">
            {selectedSubject} - Enter and manage student grades with auto-save
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved</span>
            </div>
          )}

          {/* View Toggle Buttons */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none">
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none">
              <Table2 className="h-4 w-4 mr-2" />
              Grid View
            </Button>
          </div>
        </div>
      </div>

      {/* Main Card with Tabs */}
      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader className="pb-3">
          {viewMode === "list" ? (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AssessmentType)}>
              {/* Filters and Tabs Row */}
              <div className="flex items-center justify-between">
                {/* Filters on the left */}
                <div className="flex items-center gap-3">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  {/* Tabs */}
                  <TabsList className="grid grid-cols-3">
                    {ASSESSMENT_TYPES.map((type) => (
                      <TabsTrigger key={type} value={type}>
                        {type === "CAT1" ? "CAT 1" : type === "MID" ? "Mid-Term" : "End of Term"}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
            </Tabs>
          ) : (
            // Grid View Header
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col pt-0">
          {viewMode === "list" ? (
            // LIST VIEW - Original tabbed interface
            <>
              {/* Assessment Type Content */}
              {ASSESSMENT_TYPES.map((assessmentType) => (
                <div
                  key={assessmentType}
                  className={`flex-1 overflow-hidden flex flex-col ${
                    activeTab === assessmentType ? "" : "hidden"
                  }`}>
                  {/* Table */}
                  <div className="overflow-auto flex-1">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-20 bg-background border-b">
                    <tr>
                      <th className="p-3 text-left font-semibold text-sm bg-background w-[280px]">
                        Student
                      </th>
                      <th className="p-3 text-left font-semibold text-sm bg-background w-[100px]">
                        Gender
                      </th>
                      <th className="p-3 text-center font-semibold text-sm bg-background w-[200px]">
                        Score (/{MAX_SCORES[assessmentType]})
                      </th>
                      <th className="p-3 text-center font-semibold text-sm bg-background w-[140px]">
                        Status
                      </th>
                      <th className="p-3 text-center font-semibold text-sm bg-background w-[100px]">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const gradeData = grades[student.id][assessmentType];
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-muted/70 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/30"
                          }`}>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={student.photoUrl} alt={student.name} />
                                <AvatarFallback>
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.studentId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm font-medium">{student.gender}</span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={MAX_SCORES[assessmentType]}
                                step="0.5"
                                placeholder="0"
                                value={gradeData.score ?? ""}
                                onChange={(e) =>
                                  handleScoreChange(student.id, assessmentType, e.target.value)
                                }
                                disabled={gradeData.status !== null}
                                className="w-20 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <span className="text-sm font-medium text-muted-foreground">
                                {gradeData.percentage !== null ? `(${gradeData.percentage}%)` : ""}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant={gradeData.status === "absent" ? "default" : "outline"}
                                className={cn(
                                  "h-8 px-2 text-xs font-semibold",
                                  gradeData.status === "absent" && "bg-red-600 hover:bg-red-700"
                                )}
                                disabled={gradeData.score !== null && gradeData.status !== "absent"}
                                onClick={() => handleStatusChange(student.id, assessmentType, gradeData.status === "absent" ? null : "absent")}>
                                AB
                              </Button>
                              <Button
                                size="sm"
                                variant={gradeData.status === "excused" ? "default" : "outline"}
                                className={cn(
                                  "h-8 px-2 text-xs font-semibold",
                                  gradeData.status === "excused" && "bg-blue-600 hover:bg-blue-700"
                                )}
                                disabled={gradeData.score !== null && gradeData.status !== "excused"}
                                onClick={() => handleStatusChange(student.id, assessmentType, gradeData.status === "excused" ? null : "excused")}>
                                EX
                              </Button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={`${
                                gradeData.status === "absent"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : gradeData.status === "excused"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : gradeData.grade === "A"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : gradeData.grade === "B"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : gradeData.grade === "C"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : gradeData.grade === "D"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : gradeData.grade === "E"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-600 border-gray-200"
                              }`}>
                              {gradeData.status === "absent" ? "AB" : gradeData.status === "excused" ? "EX" : gradeData.grade}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
            </>
          ) : (
            // GRID VIEW - Excel-like spreadsheet with all assessments
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-background">
                  <tr>
                    <th className="p-3 text-left font-semibold text-sm bg-background border-b border-r w-[60px] sticky left-0 z-30">
                      #
                    </th>
                    <th className="p-3 text-left font-semibold text-sm bg-background border-b border-r w-[280px] sticky left-[60px] z-30">
                      Student
                    </th>
                    <th className="p-3 text-left font-semibold text-sm bg-background border-b border-r w-[100px]">
                      Gender
                    </th>
                    {/* CAT1 Columns */}
                    <th colSpan={4} className="p-3 text-center font-semibold text-sm bg-green-50 border-b border-r">
                      CAT 1 (/{MAX_SCORES.CAT1})
                    </th>
                    {/* MID Columns */}
                    <th colSpan={4} className="p-3 text-center font-semibold text-sm bg-blue-50 border-b border-r">
                      Mid-Term (/{MAX_SCORES.MID})
                    </th>
                    {/* EOT Columns */}
                    <th colSpan={4} className="p-3 text-center font-semibold text-sm bg-purple-50 border-b border-r">
                      End of Term (/{MAX_SCORES.EOT})
                    </th>
                    {/* Average Column */}
                    <th className="p-3 text-center font-semibold text-sm bg-yellow-50 border-b w-[100px]">
                      Average
                    </th>
                  </tr>
                  <tr>
                    <th className="p-2 text-xs bg-background border-b sticky left-0 z-30"></th>
                    <th className="p-2 text-xs bg-background border-b sticky left-[60px] z-30"></th>
                    <th className="p-2 text-xs bg-background border-b border-r"></th>
                    {/* CAT1 Sub-headers */}
                    <th className="p-2 text-center text-xs font-medium bg-green-50 border-b w-[100px]">Score</th>
                    <th className="p-2 text-center text-xs font-medium bg-green-50 border-b w-[80px]">%</th>
                    <th className="p-2 text-center text-xs font-medium bg-green-50 border-b w-[80px]">Status</th>
                    <th className="p-2 text-center text-xs font-medium bg-green-50 border-b border-r w-[60px]">Grade</th>
                    {/* MID Sub-headers */}
                    <th className="p-2 text-center text-xs font-medium bg-blue-50 border-b w-[100px]">Score</th>
                    <th className="p-2 text-center text-xs font-medium bg-blue-50 border-b w-[80px]">%</th>
                    <th className="p-2 text-center text-xs font-medium bg-blue-50 border-b w-[80px]">Status</th>
                    <th className="p-2 text-center text-xs font-medium bg-blue-50 border-b border-r w-[60px]">Grade</th>
                    {/* EOT Sub-headers */}
                    <th className="p-2 text-center text-xs font-medium bg-purple-50 border-b w-[100px]">Score</th>
                    <th className="p-2 text-center text-xs font-medium bg-purple-50 border-b w-[80px]">%</th>
                    <th className="p-2 text-center text-xs font-medium bg-purple-50 border-b w-[80px]">Status</th>
                    <th className="p-2 text-center text-xs font-medium bg-purple-50 border-b border-r w-[60px]">Grade</th>
                    {/* Average Sub-header */}
                    <th className="p-2 text-center text-xs font-medium bg-yellow-50 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const cat1Data = grades[student.id].CAT1;
                    const midData = grades[student.id].MID;
                    const eotData = grades[student.id].EOT;

                    // Calculate average percentage
                    const validPercentages = [cat1Data.percentage, midData.percentage, eotData.percentage].filter(p => p !== null) as number[];
                    const averagePercentage = validPercentages.length > 0
                      ? Math.round(validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length)
                      : null;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-muted/70 transition-colors ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/30"
                        }`}>
                        <td className="p-3 text-center text-sm font-medium border-r sticky left-0 z-20 bg-inherit">
                          {index + 1}
                        </td>
                        <td className="p-3 border-r sticky left-[60px] z-20 bg-inherit">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={student.photoUrl} alt={student.name} />
                              <AvatarFallback className="text-xs">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 border-r">
                          <span className="text-sm">{student.gender}</span>
                        </td>

                        {/* CAT1 Cells */}
                        <td className="p-2 bg-green-50/50">
                          <Input
                            type="number"
                            min="0"
                            max={MAX_SCORES.CAT1}
                            step="0.5"
                            placeholder="-"
                            value={cat1Data.score ?? ""}
                            onChange={(e) => handleScoreChange(student.id, "CAT1", e.target.value)}
                            disabled={cat1Data.status !== null}
                            className="w-full h-8 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed border-green-200 focus:border-green-400 focus:ring-green-400"
                            onKeyDown={(e) => {
                              // Tab navigation support
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextRow = e.currentTarget.closest('tr')?.nextElementSibling;
                                const nextInput = nextRow?.querySelector('input');
                                if (nextInput) (nextInput as HTMLInputElement).focus();
                              }
                            }}
                          />
                        </td>
                        <td className="p-2 text-center text-sm bg-green-50/50">
                          {cat1Data.percentage !== null ? `${cat1Data.percentage}%` : "-"}
                        </td>
                        <td className="p-2 bg-green-50/50">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant={cat1Data.status === "absent" ? "default" : "outline"}
                              className={cn(
                                "h-7 px-1.5 text-xs font-semibold",
                                cat1Data.status === "absent" && "bg-red-600 hover:bg-red-700"
                              )}
                              disabled={cat1Data.score !== null && cat1Data.status !== "absent"}
                              onClick={() => handleStatusChange(student.id, "CAT1", cat1Data.status === "absent" ? null : "absent")}>
                              AB
                            </Button>
                            <Button
                              size="sm"
                              variant={cat1Data.status === "excused" ? "default" : "outline"}
                              className={cn(
                                "h-7 px-1.5 text-xs font-semibold",
                                cat1Data.status === "excused" && "bg-blue-600 hover:bg-blue-700"
                              )}
                              disabled={cat1Data.score !== null && cat1Data.status !== "excused"}
                              onClick={() => handleStatusChange(student.id, "CAT1", cat1Data.status === "excused" ? null : "excused")}>
                              EX
                            </Button>
                          </div>
                        </td>
                        <td className="p-2 text-center border-r bg-green-50/50">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              cat1Data.status === "absent"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : cat1Data.status === "excused"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : cat1Data.grade === "A"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : cat1Data.grade === "B"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : cat1Data.grade === "C"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : cat1Data.grade === "D"
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : cat1Data.grade === "E"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}>
                            {cat1Data.status === "absent" ? "AB" : cat1Data.status === "excused" ? "EX" : cat1Data.grade}
                          </Badge>
                        </td>

                        {/* MID Cells */}
                        <td className="p-2 bg-blue-50/50">
                          <Input
                            type="number"
                            min="0"
                            max={MAX_SCORES.MID}
                            step="0.5"
                            placeholder="-"
                            value={midData.score ?? ""}
                            onChange={(e) => handleScoreChange(student.id, "MID", e.target.value)}
                            disabled={midData.status !== null}
                            className="w-full h-8 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextRow = e.currentTarget.closest('tr')?.nextElementSibling;
                                const inputs = nextRow?.querySelectorAll('input');
                                if (inputs && inputs[1]) (inputs[1] as HTMLInputElement).focus();
                              }
                            }}
                          />
                        </td>
                        <td className="p-2 text-center text-sm bg-blue-50/50">
                          {midData.percentage !== null ? `${midData.percentage}%` : "-"}
                        </td>
                        <td className="p-2 bg-blue-50/50">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant={midData.status === "absent" ? "default" : "outline"}
                              className={cn(
                                "h-7 px-1.5 text-xs font-semibold",
                                midData.status === "absent" && "bg-red-600 hover:bg-red-700"
                              )}
                              disabled={midData.score !== null && midData.status !== "absent"}
                              onClick={() => handleStatusChange(student.id, "MID", midData.status === "absent" ? null : "absent")}>
                              AB
                            </Button>
                            <Button
                              size="sm"
                              variant={midData.status === "excused" ? "default" : "outline"}
                              className={cn(
                                "h-7 px-1.5 text-xs font-semibold",
                                midData.status === "excused" && "bg-blue-600 hover:bg-blue-700"
                              )}
                              disabled={midData.score !== null && midData.status !== "excused"}
                              onClick={() => handleStatusChange(student.id, "MID", midData.status === "excused" ? null : "excused")}>
                              EX
                            </Button>
                          </div>
                        </td>
                        <td className="p-2 text-center border-r bg-blue-50/50">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              midData.status === "absent"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : midData.status === "excused"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : midData.grade === "A"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : midData.grade === "B"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : midData.grade === "C"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : midData.grade === "D"
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : midData.grade === "E"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}>
                            {midData.status === "absent" ? "AB" : midData.status === "excused" ? "EX" : midData.grade}
                          </Badge>
                        </td>

                        {/* EOT Cells */}
                        <td className="p-2 bg-purple-50/50">
                          <Input
                            type="number"
                            min="0"
                            max={MAX_SCORES.EOT}
                            step="0.5"
                            placeholder="-"
                            value={eotData.score ?? ""}
                            onChange={(e) => handleScoreChange(student.id, "EOT", e.target.value)}
                            disabled={eotData.status !== null}
                            className="w-full h-8 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextRow = e.currentTarget.closest('tr')?.nextElementSibling;
                                const inputs = nextRow?.querySelectorAll('input');
                                if (inputs && inputs[2]) (inputs[2] as HTMLInputElement).focus();
                              }
                            }}
                          />
                        </td>
                        <td className="p-2 text-center text-sm bg-purple-50/50">
                          {eotData.percentage !== null ? `${eotData.percentage}%` : "-"}
                        </td>
                        <td className="p-2 bg-purple-50/50">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant={eotData.status === "absent" ? "default" : "outline"}
                              className={cn(
                                "h-7 px-1.5 text-xs font-semibold",
                                eotData.status === "absent" && "bg-red-600 hover:bg-red-700"
                              )}
                              disabled={eotData.score !== null && eotData.status !== "absent"}
                              onClick={() => handleStatusChange(student.id, "EOT", eotData.status === "absent" ? null : "absent")}>
                              AB
                            </Button>
                            <Button
                              size="sm"
                              variant={eotData.status === "excused" ? "default" : "outline"}
                              className={cn(
                                "h-7 px-1.5 text-xs font-semibold",
                                eotData.status === "excused" && "bg-blue-600 hover:bg-blue-700"
                              )}
                              disabled={eotData.score !== null && eotData.status !== "excused"}
                              onClick={() => handleStatusChange(student.id, "EOT", eotData.status === "excused" ? null : "excused")}>
                              EX
                            </Button>
                          </div>
                        </td>
                        <td className="p-2 text-center border-r bg-purple-50/50">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              eotData.status === "absent"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : eotData.status === "excused"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : eotData.grade === "A"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : eotData.grade === "B"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : eotData.grade === "C"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : eotData.grade === "D"
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : eotData.grade === "E"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}>
                            {eotData.status === "absent" ? "AB" : eotData.status === "excused" ? "EX" : eotData.grade}
                          </Badge>
                        </td>

                        {/* Average Cell */}
                        <td className="p-2 text-center bg-yellow-50/50">
                          {averagePercentage !== null ? (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-semibold">{averagePercentage}%</span>
                              <Badge
                                variant="outline"
                                className={`text-xs mt-1 ${
                                  calculateGrade(averagePercentage) === "A"
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : calculateGrade(averagePercentage) === "B"
                                    ? "bg-blue-100 text-blue-700 border-blue-300"
                                    : calculateGrade(averagePercentage) === "C"
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                    : calculateGrade(averagePercentage) === "D"
                                    ? "bg-orange-100 text-orange-700 border-orange-300"
                                    : "bg-red-100 text-red-700 border-red-300"
                                }`}>
                                {calculateGrade(averagePercentage)}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Summary Footer */}
                <tfoot className="sticky bottom-0 bg-background border-t-2">
                  <tr className="font-semibold">
                    <td colSpan={3} className="p-3 text-right border-r">
                      Class Average:
                    </td>
                    <td colSpan={3} className="p-3 text-center bg-green-50 border-r">
                      {(() => {
                        const scores = students.map(s => grades[s.id].CAT1.percentage).filter(p => p !== null) as number[];
                        return scores.length > 0 ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : "-";
                      })()}
                    </td>
                    <td colSpan={3} className="p-3 text-center bg-blue-50 border-r">
                      {(() => {
                        const scores = students.map(s => grades[s.id].MID.percentage).filter(p => p !== null) as number[];
                        return scores.length > 0 ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : "-";
                      })()}
                    </td>
                    <td colSpan={3} className="p-3 text-center bg-purple-50 border-r">
                      {(() => {
                        const scores = students.map(s => grades[s.id].EOT.percentage).filter(p => p !== null) as number[];
                        return scores.length > 0 ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : "-";
                      })()}
                    </td>
                    <td className="p-3 text-center bg-yellow-50">
                      {(() => {
                        const allScores = students.flatMap(s =>
                          [grades[s.id].CAT1.percentage, grades[s.id].MID.percentage, grades[s.id].EOT.percentage]
                        ).filter(p => p !== null) as number[];
                        return allScores.length > 0 ? `${Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)}%` : "-";
                      })()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
